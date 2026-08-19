export function Button({ children, kind = "primary", className = "", ...props }) {
  const isLoading = props["data-loading"] !== undefined ? props["data-loading"] : props.disabled;
  const loadingClass = isLoading ? "loading" : "";

  return (
    <button
      className={`button ${kind} ${loadingClass} ${className}`.trim()}
      data-loading={isLoading}
      {...props}
    >
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
