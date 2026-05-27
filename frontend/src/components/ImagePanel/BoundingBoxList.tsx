import type { BBoxTemplate } from "../../types/ProjectState";
import type { BBox } from "../../types/BBox";
import { MaximizeIcon } from "./icons";
import styles from "./BoundingBoxList.module.css";

const PREVIEW_W = 48;
const PREVIEW_H = 32;

function BBoxPreview({ bbox }: { bbox: BBox }) {
	const aspect = bbox.width / bbox.height;
	let w = PREVIEW_W;
	let h = PREVIEW_H;
	if (aspect > PREVIEW_W / PREVIEW_H) {
		h = PREVIEW_W / aspect;
	} else {
		w = PREVIEW_H * aspect;
	}
	const x = (PREVIEW_W - w) / 2;
	const y = (PREVIEW_H - h) / 2;

	return (
		<svg
			className={styles.preview}
			width={PREVIEW_W}
			height={PREVIEW_H}
			viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
		>
			<rect
				x={x}
				y={y}
				width={w}
				height={h}
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				rx="1"
			/>
		</svg>
	);
}

interface ItemProps {
	bbox: BBox;
	isLive?: boolean;
	onClick?: () => void;
	onRemove?: (e: React.MouseEvent) => void;
}

function BBoxItem({ bbox, isLive, onClick, onRemove }: ItemProps) {
	return (
		<div
			className={`${styles.item} ${isLive ? styles.liveItem : ""}`}
			onClick={onClick}
		>
			<BBoxPreview bbox={bbox} />
			<div className={styles.info}>
				<span className={styles.dims}>
					{Math.round(bbox.width)} × {Math.round(bbox.height)}
				</span>
				<span className={styles.unit}>pixels</span>
			</div>
			{isLive && <span className={styles.liveBadge}>live</span>}
			{onRemove && (
				<button
					className={styles.removeBtn}
					onClick={onRemove}
					aria-label="Remove template"
				>
					×
				</button>
			)}
		</div>
	);
}

interface BoundingBoxListProps {
	templates: BBoxTemplate[];
	liveDragBox: BBox | null;
	currentImageWidth: number | null;
	currentImageHeight: number | null;
	onApplyTemplate: (bbox: BBox) => void;
	onRemoveTemplate: (id: number) => void;
	onFullImage: () => void;
}

export default function BoundingBoxList({
	templates,
	liveDragBox,
	currentImageWidth,
	currentImageHeight,
	onApplyTemplate,
	onRemoveTemplate,
	onFullImage,
}: BoundingBoxListProps) {
	const isEmpty = !liveDragBox && templates.length === 0;
	const showFullImage =
		currentImageWidth !== null && currentImageHeight !== null;

	return (
		<div className={styles.container}>
			<p className={styles.header}>Saved Boxes</p>
			<div className={styles.list}>
				{showFullImage && (
					<div
						className={styles.fullImageItem}
						onClick={onFullImage}
						title="Use the entire image as the bounding box"
					>
						<MaximizeIcon size={16} className={styles.fullImageIcon} />
						<div className={styles.info}>
							<span className={styles.dims}>Full Image</span>
							<span className={styles.unit}>
								{currentImageWidth} × {currentImageHeight}
							</span>
						</div>
					</div>
				)}
				{liveDragBox && <BBoxItem bbox={liveDragBox} isLive />}
				{templates.map((t) => (
					<BBoxItem
						key={t.id}
						bbox={t.bbox}
						onClick={() => onApplyTemplate(t.bbox)}
						onRemove={(e) => {
							e.stopPropagation();
							onRemoveTemplate(t.id);
						}}
					/>
				))}
				{isEmpty && !showFullImage && (
					<p className={styles.empty}>
						Draw a bounding box on any image to save it here for reuse.
					</p>
				)}
			</div>
		</div>
	);
}
