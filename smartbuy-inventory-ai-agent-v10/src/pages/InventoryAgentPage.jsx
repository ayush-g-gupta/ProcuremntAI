import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, Card, Metric } from "../components/UI";

const demoProducts = [];

export function InventoryAgentPage() {
  const [products, setProducts] = useState(demoProducts);
  const [sku, setSku] = useState("BTMC-450");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const savedResult = sessionStorage.getItem("smartbuy:inventory-agent-result");
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch {
        sessionStorage.removeItem("smartbuy:inventory-agent-result");
      }
    }

    fetch("/api/inventory")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Unable to load inventory"))))
      .then((payload) => {
        const items = payload.data || [];
        setProducts(items);
        if (items.length && !items.some((item) => item.sku === sku)) {
          setSku(items[0].sku);
        }
      })
      .catch(() => setError("Unable to load inventory products"));
  }, []);

  async function runAgent() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/inventory/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Inventory check failed");
      setResult(payload.data);
      sessionStorage.setItem("smartbuy:inventory-agent-result", JSON.stringify(payload.data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const assessment = result?.assessment;
  const ai = result?.ai;
  const riskClass = ai?.riskLevel || assessment?.riskLevel || "";

  return (
    <div className="narrow-content inventory-agent-page">
      <div className="page-heading">
        <p className="eyebrow">AGENTIC PROCUREMENT</p>
        <h1>Inventory Check AI Agent</h1>
        <p>Run an AI-assisted inventory assessment against the current procurement snapshot.</p>
      </div>

      <Card className="agent-run-card">
        <div>
          <span className="agent-badge"><Icon name="alert" size={13} /> INVENTORY AGENT</span>
          <h2>Check inventory health</h2>
          <p>The agent reads inventory data, applies procurement rules, evaluates rule-based risk, then asks Capgemini GenAI for the AI confidence score, explanation, and actions.</p>
        </div>
        <div className="agent-controls">
          <label>
            Product
            <select value={sku} onChange={(event) => setSku(event.target.value)}>
              {products.map((product) => <option key={product.sku} value={product.sku}>{product.sku} · {product.name}</option>)}
            </select>
          </label>
          <Button onClick={runAgent} disabled={loading}>
            {loading ? "Running agent…" : "Run inventory check"} {!loading && <Icon name="arrow" size={15} />}
          </Button>
        </div>
      </Card>

      {error && <div className="agent-error">{error}</div>}

      {result && (
        <>
          <section className="agent-result-hero">
            <div>
              <p className="eyebrow light">✦ AGENT RESULT · {result.runId}</p>
              <h2>{result.snapshot.name}</h2>
              <p>Checked {new Date(result.checkedAt).toLocaleString()} · Source: {result.dataSource}</p>
            </div>
            <div className={`agent-risk ${riskClass}`}>
              <strong>{riskClass.toUpperCase()}</strong>
              <span>{ai?.used ? "AI risk" : "Rule-based risk"}</span>
            </div>
          </section>

          <section className="metric-grid agent-metrics">
            <Card><Metric label="AI confidence" value={ai?.confidence != null ? `${ai.confidence}%` : "—"} /></Card>
            <Card><Metric label="AI risk" value={ai?.riskLevel ? ai.riskLevel.toUpperCase() : assessment.riskLevel.toUpperCase()} /></Card>
            <Card><Metric label="Days of cover" value={assessment.daysOfCover} suffix="days" /></Card>
            <Card><Metric label="14-day projected stock" value={assessment.projected14d.toLocaleString()} suffix="units" /></Card>
            <Card><Metric label="Suggested reorder" value={assessment.recommendedQuantity.toLocaleString()} suffix="units" /></Card>
          </section>

          <section className="split-cards">
            <Card>
              <div className="card-title"><h3>Agent reasoning signals</h3></div>
              {assessment.signals.length ? assessment.signals.map((signal) => <div className="agent-signal" key={signal}><Icon name="alert" size={14} />{signal}</div>) : <div className="agent-signal"><Icon name="check" size={14} />No inventory risk signals detected.</div>}
            </Card>
            <Card>
              <div className="card-title"><h3>Inventory snapshot</h3></div>
              <div className="key-grid">
                <Metric label="Current inventory" value={result.snapshot.currentInventory.toLocaleString()} />
                <Metric label="Safety stock" value={result.snapshot.safetyStock.toLocaleString()} />
                <Metric label="Lead time" value={result.snapshot.leadTimeDays} suffix="days" />
                <Metric label="Supplier score" value={result.snapshot.supplierRating} suffix="/100" />
              </div>
            </Card>
          </section>

          <Card className="agent-explanation">
            <div className="agent-ai-heading"><span>✦</span><div><b>Capgemini AI analysis</b><small>{result.ai.used ? `${result.ai.provider} · ${result.ai.model}` : "Deterministic fallback · API response unavailable"}</small></div></div>
            <p>{result.ai.explanation?.summary || "Capgemini AI did not return an explanation. Check the AI API note below."}</p>
            {result.ai.explanation?.actions?.length > 0 && <><h4>Recommended actions</h4><ul>{result.ai.explanation.actions.map((action) => <li key={action}>{action}</li>)}</ul></>}
            {result.ai.error && <small className="agent-api-note">AI API note: {result.ai.error}</small>}
          </Card>
        </>
      )}
    </div>
  );
}
