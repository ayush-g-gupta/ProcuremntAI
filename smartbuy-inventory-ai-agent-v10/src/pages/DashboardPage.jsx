import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button, Card, Metric } from "../components/UI";
import { dashboardMetrics } from "../data/procurementData";

function getRuleBasedPriority(snapshot) {
  const projected14d = snapshot.currentInventory - snapshot.forecastDemand14d;
  const projected30d = snapshot.currentInventory - snapshot.forecastDemand30d;
  const daysOfCover = snapshot.currentInventory / Math.max(snapshot.dailyDemand, 1);
  const reorderPoint =
    snapshot.safetyStock + snapshot.dailyDemand * snapshot.leadTimeDays;

  if (
    projected14d < 0 ||
    projected30d < 0 ||
    daysOfCover < snapshot.leadTimeDays
  ) {
    return 3;
  }

  if (projected14d < snapshot.safetyStock || snapshot.currentInventory < reorderPoint) {
    return 2;
  }

  return 1;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [inventoryResult, setInventoryResult] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/inventory")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load inventory");
        }
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) {
          setInventoryItems(payload.data || []);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setInventoryError(error.message || "Unable to load inventory");
        }
      });

    const savedResult = sessionStorage.getItem("smartbuy:inventory-agent-result");
    if (savedResult) {
      try {
        setInventoryResult(JSON.parse(savedResult));
      } catch {
        sessionStorage.removeItem("smartbuy:inventory-agent-result");
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const highestPriorityInventory = useMemo(() => {
    if (!inventoryItems.length) return null;

    return [...inventoryItems].sort(
      (a, b) => getRuleBasedPriority(b) - getRuleBasedPriority(a)
    )[0];
  }, [inventoryItems]);

  async function runInventoryAgent() {
    const sku = inventoryResult?.snapshot?.sku || highestPriorityInventory?.sku;

    if (!sku) {
      setInventoryError("No inventory product is available for an AI check.");
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");

    try {
      const response = await fetch("/api/inventory/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Inventory check failed");
      }

      setInventoryResult(payload.data);
      sessionStorage.setItem(
        "smartbuy:inventory-agent-result",
        JSON.stringify(payload.data)
      );

      // Preserve the original procurement flow.
      navigate("/recommendation", {
        state: { inventoryResult: payload.data },
      });
    } catch (error) {
      setInventoryError(error.message || "Unable to run inventory agent");
    } finally {
      setInventoryLoading(false);
    }
  }

  const assessment = inventoryResult?.assessment;
  const displayedSnapshot =
    inventoryResult?.snapshot || null;

  const aiRiskLevel = inventoryResult?.ai?.riskLevel;
  const displayedRiskLevel =
    aiRiskLevel || assessment?.riskLevel || null;

  const displayedRiskLabel = displayedRiskLevel ?
    displayedRiskLevel.charAt(0).toUpperCase() +
    displayedRiskLevel.slice(1) : "-";

  const displayedSummary =
    inventoryResult?.ai?.explanation?.summary ||
    (inventoryResult
      ? "AI analysis is unavailable for this inventory check."
      : "Inventory risk is prioritized from the current inventory snapshot.");

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">PROCUREMENT OVERVIEW</p>
        <h1>Good morning, Sophie</h1>
        <p>Here are the procurement activities that need your attention.</p>
      </div>

      <section className="risk-hero">
        <div className="risk-copy">
          <span className="alert-pill">
            <Icon name="alert" size={13} />
            {inventoryResult 
            ? inventoryResult?.ai?.used
              ? `AI inventory risk: ${displayedRiskLabel}`
              :"AI Risk Completed"
              : "AI Check Required"}
          </span>

          <span className="muted-on-dark">
            {inventoryResult ? "AI Alert · Just now" : "No AI Analysis Run Yet"}
          </span>

          <h2>
            {displayedSnapshot?.name || "Run an AI Inventory check"}
          </h2>

          <p>{displayedSummary}</p>

          <div className="stat-row">
            <Metric
              label="Current inventory"
              value={
                displayedSnapshot?.currentInventory != null
                  ? displayedSnapshot.currentInventory.toLocaleString()
                  : "—"
              }
              suffix="units"
              dark
            />

            <Metric
              label="Safety stock"
              value={
                displayedSnapshot?.safetyStock != null
                  ? displayedSnapshot.safetyStock.toLocaleString()
                  : "—"
              }
              suffix="units"
              dark
            />

            <Metric
              label="Forecast demand"
              value={
                displayedSnapshot?.forecastDemand14d != null
                  ? displayedSnapshot.forecastDemand14d.toLocaleString()
                  : "—"
              }
              suffix="units"
              dark
            />

            <Metric
              label="Risk level"
              value={displayedRiskLabel}
              dark
            />
          </div>

          <div className="button-row">
            <Button onClick={runInventoryAgent} disabled={inventoryLoading}>
              {inventoryLoading
                ? "Analyzing inventory…"
                : "Run Inventory AI Check"}
              {!inventoryLoading && <Icon name="arrow" size={15} />}
            </Button>

            <Link className="button" to="/inventory-agent">
              Open Inventory AI
            </Link>
          </div>
        </div>

        <div className="risk-orb">
          <span>{displayedRiskLevel ? displayedRiskLevel.slice(0, 3).toUpperCase() : "-"}</span>
          <small>{inventoryResult?.ai?.used ? "AI Inventory Risk" : "Priority"}</small>
        </div>
      </section>

      {inventoryError && <div className="agent-error">{inventoryError}</div>}

      {inventoryResult && assessment && (
        <section className="agent-dashboard-result">
          <div className="agent-result-hero">
            <div>
              <p className="eyebrow light">
                ✦ INVENTORY AGENT RESULT · {inventoryResult.runId}
              </p>
              <h2>{inventoryResult.snapshot.name}</h2>
              <p>
                Checked {new Date(inventoryResult.checkedAt).toLocaleString()} ·
                Source: {inventoryResult.dataSource}
              </p>
            </div>

            <div className={`agent-risk ${displayedRiskLevel}`}>
              <strong>{displayedRiskLevel.toUpperCase()}</strong>
              <span>AI risk level</span>
            </div>
          </div>

          <section className="metric-grid agent-metrics">
            <Card>
              <Metric
                label="AI confidence"
                value={
                  inventoryResult?.ai?.confidence != null
                    ? `${inventoryResult.ai.confidence}%`
                    : "—"
                }
              />
            </Card>

            <Card>
              <Metric
                label="Days of cover"
                value={assessment.daysOfCover}
                suffix="days"
              />
            </Card>

            <Card>
              <Metric
                label="14-day projected stock"
                value={assessment.projected14d.toLocaleString()}
                suffix="units"
              />
            </Card>

            <Card>
              <Metric
                label="Suggested reorder"
                value={assessment.recommendedQuantity.toLocaleString()}
                suffix="units"
              />
            </Card>
          </section>

          <Card className="agent-explanation">
            <div className="agent-ai-heading">
              <span>✦</span>
              <div>
                <b>Capgemini AI analysis</b>
                <small>
                  {inventoryResult.ai.used
                    ? `${inventoryResult.ai.provider} · ${inventoryResult.ai.model}`
                    : "AI response unavailable"}
                </small>
              </div>
            </div>

            <p>
              {inventoryResult.ai.explanation?.summary ||
                "Capgemini AI did not return an explanation. Check the AI API note below."}
            </p>

            {inventoryResult.ai.explanation?.actions?.length > 0 && (
              <>
                <h4>Recommended actions</h4>
                <ul>
                  {inventoryResult.ai.explanation.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </>
            )}

            {inventoryResult.ai.error && (
              <small className="agent-api-note">
                AI API note: {inventoryResult.ai.error}
              </small>
            )}
          </Card>
        </section>
      )}

      <section className="metric-grid">
        {dashboardMetrics.map((item) => (
          <Card className="dashboard-metric" key={item.label}>
            <span className={`metric-icon ${item.tone}`}>
              <Icon name={item.icon} size={18} />
            </span>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
            <em>{item.note}</em>
          </Card>
        ))}
      </section>

      <section className="dashboard-bottom">
        <Card className="activity">
          <div className="card-title">
            <h3>Recent activity</h3>
          </div>

          {[
            "Quote SB-2026-08200 approved",
            "Order SB-ORD-08100 shipped",
            "AI recommendation generated for BTMC-450",
          ].map((text, index) => (
            <div className="activity-row" key={text}>
              <span className={`dot d${index}`}>
                <Icon name="check" size={13} />
              </span>
              <div>
                {text}
                <small>{index + 2} hours ago</small>
              </div>
            </div>
          ))}
        </Card>

        <aside className="insight">
          <span>✦ SMART PROCUREMENT INSIGHT</span>
          <p>
            {highestPriorityInventory ? (
              <>
                Review <b>{highestPriorityInventory.name}</b> (
                {highestPriorityInventory.sku}) based on the highest current
                inventory risk priority.
              </>
            ) : (
              "Review the current inventory priority to identify the next procurement action."
            )}
          </p>

          <button
            className="button"
            onClick={runInventoryAgent}
            disabled={inventoryLoading}
          >
            {inventoryLoading
              ? "Analyzing inventory…"
              : "Review AI Recommendation"}
          </button>
        </aside>
      </section>
    </>
  );
}
