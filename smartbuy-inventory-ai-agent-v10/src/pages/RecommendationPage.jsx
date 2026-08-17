import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button, Card, Metric } from "../components/UI";

export function RecommendationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const inventoryResult = useMemo(() => {
    if (location.state?.inventoryResult) return location.state.inventoryResult;
    try {
      const saved = sessionStorage.getItem("smartbuy:inventory-agent-result");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.inventoryResult) {
      sessionStorage.setItem(
        "smartbuy:inventory-agent-result",
        JSON.stringify(location.state.inventoryResult),
      );
    }
  }, [location.state]);

  const snapshot = inventoryResult?.snapshot;
  const assessment = inventoryResult?.assessment;
  const ai = inventoryResult?.ai;
  const risk = ai?.riskLevel || assessment?.riskLevel || "medium";
  const confidence = ai?.confidence;
  const summary =
    ai?.explanation?.summary ||
    "The AI recommendation is unavailable until the Capgemini API returns a valid assessment.";

  const reasons = [
    `${snapshot?.currentInventory?.toLocaleString() || "—"} units currently available`,
    `${assessment?.daysOfCover ?? "—"} days of inventory cover`,
    `${snapshot?.leadTimeDays ?? "—"}-day supplier lead time`,
    `Supplier rating ${snapshot?.supplierRating ?? "—"}/100`,
    `${assessment?.projected14d?.toLocaleString() || "—"} units projected after 14 days`,
    ...(assessment?.signals || []).slice(0, 2),
  ];

  const proceedToQuote = () => {
    navigate("/quotes", { state: { inventoryResult } });
  };

  return (
    <div className="narrow-content">
      <div className="breadcrumb">
        Dashboard <Icon name="chevron" size={12} /> AI recommendation
      </div>

      <section className="recommendation-hero">
        <div>
          <p className="eyebrow light">✦ AI-POWERED INVENTORY RECOMMENDATION</p>
          <h1>Your Purchase Recommendation</h1>
          <p>Generated from the Inventory Check AI Agent for {snapshot?.sku || "BTMC-450"}</p>
        </div>

        <div className="score">
          <b>{confidence != null ? `${confidence}%` : "—"}</b>
          <small>AI confidence</small>
          <span>{ai?.used ? "Capgemini AI assessment" : "AI response unavailable"}</span>
        </div>

        <div className="product-feature">
          <span className="product-mark">
            <Icon name="cube" size={22} />
          </span>
          <div>
            <h2>{snapshot?.sku || "BTMC-450"}</h2>
            <p>{snapshot?.name || "Battery Thermal Management Module"}</p>
            <small>{snapshot?.supplier || "EV Components Manufacturing"}</small>
          </div>
          <strong>
            ${snapshot?.unitPrice?.toFixed(2) || "18.40"}/unit
            <small>
              ${snapshot?.unitPrice && assessment?.recommendedQuantity
                ? (snapshot.unitPrice * assessment.recommendedQuantity).toLocaleString(undefined, { maximumFractionDigits: 2 })
                : "—"} total
            </small>
          </strong>
        </div>

        <h3>Why this recommendation?</h3>
        <div className="reason-grid">
          {reasons.map((x) => (
            <span key={x}>
              <Icon name="check" size={14} />
              {x}
            </span>
          ))}
        </div>
      </section>

      <section className="split-cards">
        <Card>
          <h3>AI risk assessment</h3>
          {[
            ["Inventory risk", risk],
            ["Data confidence", confidence != null ? `${confidence}%` : "Unavailable"],
            ["Days of cover", assessment?.daysOfCover != null ? `${assessment.daysOfCover} days` : "—"],
            ["Reorder quantity", assessment?.recommendedQuantity != null ? `${assessment.recommendedQuantity.toLocaleString()} units` : "—"],
          ].map(([label, value]) => (
            <div className="risk-line" key={label}>
              <span>
                {label}
                <b>{String(value).toUpperCase()}</b>
              </span>
              <i />
            </div>
          ))}
        </Card>

        <Card>
          <h3>Key inventory metrics</h3>
          <div className="key-grid">
            <Metric label="Current inventory" value={snapshot?.currentInventory?.toLocaleString() || "—"} />
            <Metric label="Safety stock" value={snapshot?.safetyStock?.toLocaleString() || "—"} />
            <Metric label="14-day demand" value={snapshot?.forecastDemand14d?.toLocaleString() || "—"} />
            <Metric label="Supplier score" value={snapshot?.supplierRating != null ? `${snapshot.supplierRating}/100` : "—"} />
          </div>
        </Card>
      </section>

      <Card className="explanation">
        <b>✦ Capgemini AI explanation</b>
        <p>{summary}</p>
        {ai?.explanation?.actions?.length > 0 && (
          <ul>
            {ai.explanation.actions.map((action) => <li key={action}>{action}</li>)}
          </ul>
        )}
        {ai?.error && <small className="agent-api-note">AI API note: {ai.error}</small>}
      </Card>

      <div className="sticky-action">
        <Button onClick={proceedToQuote} disabled={!inventoryResult}>
          Proceed to quote <Icon name="arrow" size={16} />
        </Button>
        <Link className="button" to="/">Back to dashboard</Link>
      </div>
    </div>
  );
}
