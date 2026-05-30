import styles from "./Header.module.css";

const METRICS = [
	{ value: "~17%", label: "Rugosity Error" },
	{ value: "~2%", label: "Fractal Dim. Error" },
	{ value: "<5s", label: "Processing Time" },
];

function Header() {
	return (
		<header className={styles.header}>
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
