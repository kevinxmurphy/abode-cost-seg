export default function Badge({ children, variant = "turq", style = {} }) {
  const variants = {
    turq: {
      background: "var(--turq-bg)",
      color: "var(--turq)",
      border: "1px solid var(--turq-light)",
    },
    adobe: {
      background: "var(--adobe-light)",
      color: "var(--adobe-dark)",
      border: "1px solid var(--adobe-light)",
    },
    dust: {
      background: "var(--surface-2)",
      color: "var(--dust)",
      border: "1px solid var(--border)",
    },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 12px",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-primary)",
        fontWeight: 500,
        fontSize: "12px",
        letterSpacing: "0.02em",
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
