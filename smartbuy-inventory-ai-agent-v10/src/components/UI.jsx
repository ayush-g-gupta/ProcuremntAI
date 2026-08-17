export function Button({ children, kind = "primary", ...props }) {
  return (
    <button className={`button ${kind}`} {...props}>
      {children}
    </button>
  );
}
export function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Metric({ label, value, suffix, dark = false }) {
  return (
    <div className={`metric ${dark ? "metric-dark" : ""}`}>
      <small>{label}</small>
      <strong>{value}</strong>
      {suffix && <span>{suffix}</span>}
    </div>
  );
}
