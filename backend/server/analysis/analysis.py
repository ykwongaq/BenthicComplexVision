import logging
import math
import multiprocessing as mp
from typing import Dict, List

import cv2
import numpy as np

# Throw error when overflow occurs
np.seterr(over="raise")


def _compute_range_for_kernel(args):
    """
    Worker: compute aggregated height-range for a single kernel size.
    Top-level so it's picklable for multiprocessing.Pool.
    """
    depth, k, aggregation, crop_border = args

    H, W = depth.shape
    if k > H or k > W:
        return None

    kernel = np.ones((k, k), dtype=np.uint8)
    local_max = cv2.dilate(depth, kernel)
    local_min = cv2.erode(depth, kernel)
    height_range = local_max - local_min

    if crop_border:
        half = k // 2
        valid = height_range[half : H - half, half : W - half].ravel()
    else:
        valid = height_range.ravel()

    valid = valid[np.isfinite(valid)]
    if valid.size == 0:
        return None

    valid = valid + 1e-6

    if aggregation == "median":
        agg_value = float(np.median(valid))
    elif aggregation == "mean":
        agg_value = float(np.exp(np.mean(np.log(valid))))
    else:
        raise ValueError(
            f"Unsupported aggregation '{aggregation}'. Use 'mean' or 'median'."
        )

    return math.log(k), math.log(agg_value)


class Analysis:
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)

    def cal_colony_height(self, depth_map: np.ndarray, real_distance: List[Dict]):
        calib_depths = []
        calib_reals = []
        for point in real_distance:
            x, y, d = point["x"], point["y"], point["distance"]
            if 0 <= y < depth_map.shape[0] and 0 <= x < depth_map.shape[1]:
                calib_depths.append(depth_map[y, x])
                calib_reals.append(d)

        if len(calib_depths) < 2:
            raise ValueError(
                "Need at least two real-distance calibration points to map depth values."
            )

        calib_depths = np.array(calib_depths)
        calib_reals = np.array(calib_reals)

        A = np.vstack([calib_depths, np.ones_like(calib_depths)]).T
        a, b = np.linalg.lstsq(A, calib_reals, rcond=None)[0]

        valid_pixels = depth_map.flatten()

        real_min = a * np.min(valid_pixels) + b
        real_max = a * np.max(valid_pixels) + b
        height_range = abs(real_max - real_min)

        return float(height_range)

    def _auto_kernel_sizes(
        self,
        depth_shape,
        num_scales: int = 8,
        min_kernel: int = 3,
        max_fraction: float = 0.25,
    ) -> List[int]:
        """
        Automatically pick kernel sizes covering scales from fine to coarse,
        based on the depth map shape.

        Strategy: a geometric (log-spaced) progression from `min_kernel`
        up to `max_fraction * min(H, W)`. Geometric spacing produces points
        evenly distributed in log-space, which gives a much more reliable
        linear fit for the fractal dimension.
        """
        H, W = depth_shape
        short_side = min(H, W)

        max_kernel = int(short_side * max_fraction)
        if max_kernel % 2 == 0:
            max_kernel -= 1
        max_kernel = max(max_kernel, min_kernel + 2)

        log_sizes = np.linspace(math.log(min_kernel), math.log(max_kernel), num_scales)
        raw_sizes = np.exp(log_sizes)

        seen = set()
        kernel_sizes = []
        for s in raw_sizes:
            k = int(round(s))
            if k % 2 == 0:
                k += 1
            k = max(k, min_kernel)
            if k not in seen:
                seen.add(k)
                kernel_sizes.append(k)

        return sorted(kernel_sizes)

    def cal_fractal_dimension(
        self,
        depth: np.ndarray,
        aggregation: str = "mean",
        crop_border: bool = True,
        num_scales: int = 2,
        min_kernel: int = 5,
        max_fraction: float = 0.3,
        num_workers: int = None,
    ) -> float:
        depth = depth.astype(np.float32)
        if num_workers is None:
            num_workers = mp.cpu_count()

        kernel_sizes = self._auto_kernel_sizes(
            depth.shape,
            num_scales=num_scales,
            min_kernel=min_kernel,
            max_fraction=max_fraction,
        )
        print(f"Auto-selected kernel sizes: {kernel_sizes}")

        for k in kernel_sizes:
            if k % 2 == 0 or k < 1:
                raise ValueError(
                    f"Kernel sizes must be positive odd integers, got {k}."
                )

        # Largest-first for better load balancing
        sorted_kernels = sorted(kernel_sizes, reverse=True)
        tasks = [(depth, k, aggregation, crop_border) for k in sorted_kernels]

        if num_workers == 1:
            raw_results = [_compute_range_for_kernel(task) for task in tasks]
        else:
            with mp.Pool(processes=num_workers) as pool:
                raw_results = pool.map(_compute_range_for_kernel, tasks)

        results = [r for r in raw_results if r is not None]

        if len(results) < 2:
            self.logger.warning("Not enough valid scales to fit fractal dimension.")
            return None

        results.sort(key=lambda x: x[0])
        log_scales, log_ranges = zip(*results)

        slope, _ = np.polyfit(log_scales, log_ranges, 1)
        return float(3 - slope)

    def cal_gradient_rugosity(
        self, depth: np.ndarray, filter_map: np.ndarray = None, kernal_size: int = 137
    ) -> float:

        sobel_x, sobel_y = self.generate_sobel_filter(kernal_size)
        grad_x = cv2.filter2D(depth, -1, sobel_x)
        grad_y = cv2.filter2D(depth, -1, sobel_y)
        grad = np.sqrt(grad_x**2 + grad_y**2)

        if filter_map is not None:
            grad = grad[filter_map]

            if len(grad) == 0:
                return None

        # gradient rugosity is the sum of gradient devided by the number of pixels
        return np.mean(grad) / (kernal_size**2)

    def generate_sobel_filter(self, size):
        """
        Generate Sobel filters for a given odd size.

        Parameters:
            size (int): The size of the Sobel filter (must be an odd number).

        Returns:
            sobel_x (ndarray): The Sobel filter for detecting horizontal gradients.
            sobel_y (ndarray): The Sobel filter for detecting vertical gradients.
        """
        if size % 2 == 0:
            raise ValueError("Size must be an odd number.")

        # Compute the range of values for the filter
        range_vals = np.arange(-(size // 2), size // 2 + 1)

        # Horizontal Sobel filter (Sobel X)
        sobel_x = np.zeros((size, size), dtype=int)
        for i, row in enumerate(range_vals):
            sobel_x[i, :] = row

        # Vertical Sobel filter (Sobel Y)
        sobel_y = sobel_x.T  # Transpose of Sobel X

        return sobel_x, sobel_y
