// Placeholder wrapper for future illustration assets.
// Each instance should be replaced with final SVG art.

export default function IllustrationSlot({ name, width = 400, height = 300, style = {} }) {
  return (
    // <!-- ILLUSTRATION: {name} -->
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        maxWidth: width,
        aspectRatio: `${width} / ${height}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border-strong)",
        background: "var(--surface)",
        color: "var(--dust)",
        fontSize: "12px",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
        ...style,
      }}
    >
      {/* ILLUSTRATION: {name} */}
      <svg
        width="60%"
        height="60%"
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.25 }}
      >
        {/* Geometric property silhouette placeholder */}
        <rect x="40" y="60" width="120" height="80" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="100,20 40,60 160,60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="65" y="85" width="25" height="35" rx="2" stroke="currentColor" strokeWidth="1" />
        <rect x="110" y="85" width="25" height="25" rx="2" stroke="currentColor" strokeWidth="1" />
        <line x1="60" y1="140" x2="140" y2="140" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}
