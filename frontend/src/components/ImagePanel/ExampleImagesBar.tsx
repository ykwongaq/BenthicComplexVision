import { useState } from "react";
import styles from "./ExampleImagesBar.module.css";
import sample1 from "../../assets/images/sample_1.jpg";
import sample2 from "../../assets/images/sample_2.jpg";
import sample3 from "../../assets/images/sample_3.jpg";
import sample4 from "../../assets/images/sample_4.jpg";

interface ExampleImagesBarProps {
	onLoadExample: (files: File[]) => void;
}

const EXAMPLE_IMAGES = [
	{ id: "sample_1", label: "Sample 1", src: sample1 },
	{ id: "sample_2", label: "Sample 2", src: sample2 },
	{ id: "sample_3", label: "Sample 3", src: sample3 },
	{ id: "sample_4", label: "Sample 4", src: sample4 },
];

function ExampleImagesBar({ onLoadExample }: ExampleImagesBarProps) {
	const [isLoading, setIsLoading] = useState<string | null>(null);

	const loadImageAsFile = async (src: string, filename: string) => {
		try {
			setIsLoading(filename);
			const response = await fetch(src);
			const blob = await response.blob();
			const file = new File([blob], filename, { type: blob.type });
			onLoadExample([file]);
		} catch (err) {
			console.error("Failed to load example image:", err);
		} finally {
			setIsLoading(null);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h3 className={styles.title}>Example Images</h3>
				<p className={styles.desc}>
					Click an image to load it as a starting point
				</p>
			</div>
			<div className={styles.gallery}>
				{EXAMPLE_IMAGES.map((img) => (
					<button
						key={img.id}
						className={styles.imageCard}
						onClick={() => loadImageAsFile(img.src, img.id + ".jpg")}
						disabled={isLoading !== null}
						title={`Load ${img.label}`}
					>
						<img src={img.src} alt={img.label} className={styles.image} />
						<div className={styles.overlay}>
							{isLoading === img.id + ".jpg" ? (
								<div className={styles.spinner} />
							) : (
								<span className={styles.loadText}>Load</span>
							)}
						</div>
						<p className={styles.label}>{img.label}</p>
					</button>
				))}
			</div>
		</div>
	);
}

export default ExampleImagesBar;
