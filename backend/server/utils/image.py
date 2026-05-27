import io

import numpy as np
from PIL import Image


async def read_image_file(image_file) -> np.ndarray:
    # Read the uploaded image file into a numpy array (BGR format)
    contents = await image_file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = np.array(image)
    return image


def rgb_image_to_bgr(image: np.ndarray) -> np.ndarray:
    return image[:, :, ::-1]
