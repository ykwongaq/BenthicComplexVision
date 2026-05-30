import styles from "./Header.module.css";

const METRICS = [
	{ value: "~17%", label: "Rugosity Error" },
	{ value: "~2%", label: "Fractal Dim. Error" },
	{ value: "<5s", label: "Processing Time" },
];

function Header() {
	return (
		<header className={styles.header}>
			<div className={styles.headerActions}>
				<a
					className={styles.tutorialButton}
					href={`${import.meta.env.BASE_URL}tutorial.pdf`}
					download="BCV-Tutorial.pdf"
					aria-label="Download tutorial (PDF)"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					<span className={styles.tutorialTooltip}>Tutorial (PDF)</span>
				</a>

				<a
					className={`${styles.tutorialButton} ${styles.youtubeButton}`}
					href="https://youtu.be/YTZyvqFltRY"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Watch video tutorial on YouTube"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
					</svg>
					<span className={styles.tutorialTooltip}>Video Tutorial</span>
				</a>
			</div>

			<div className={styles.container}>
				<span className={styles.badge}>Open-Access AI Tool</span>

				<h1 className={styles.title}>
					Benthic<span className={styles.titleAccent}>Complex</span>Vision
					<span className={styles.titleAbbr}> (BCV)</span>
				</h1>

				<p className={styles.subtitle}>
					Rapid AI-based structural complexity estimation of benthic habitats
					from a single top-down image — rugosity, fractal dimension, and colony
					height in seconds.
				</p>

				<div className={styles.metricsBar}>
					{METRICS.map((m, i) => (
						<div key={m.label} className={styles.metricGroup}>
							{i > 0 && <div className={styles.divider} />}
							<div className={styles.metric}>
								<span className={styles.metricValue}>{m.value}</span>
								<span className={styles.metricLabel}>{m.label}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</header>
	);
}

export default Header;
