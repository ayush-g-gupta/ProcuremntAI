import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/UI";
import { Icon } from "../components/Icon";
import { workflow } from "../data/procurementData";
export function ApprovalPage() {
  const n = useNavigate();
  const details = [
    ["Product", "BTMC-450"],
    ["Quantity", "2,500 units"],
    ["Requester", "Sophie Anderson"],
    ["Department", "Procurement"],
    ["Supplier", "EV Components Manufacturing"],
    ["Delivery date", "24 Aug 2026"],
    ["Total amount", "$47,200"],
    ["Quote reference", "SB-2026-08452"],
  ];
  return (
    <div className="approval-layout">
      <div className="approval-main">
        <div className="breadcrumb">
          Quote <Icon name="chevron" size={12} /> Purchase approval
        </div>
        <h1>Purchase Approval</h1>
        <p className="subhead">
          Internal approval required before placing the order.
        </p>
        <Card>
          <h3>Approval request</h3>
          <div className="request-grid">
            {details.map(([l, v]) => (
              <div key={l}>
                <small>{l}</small>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </Card>
        <Card className="workflow">
          <h3>Approval workflow</h3>
          {workflow.map((s, i) => (
            <div
              className={i === 0 ? "done" : i === 1 ? "current" : "waiting"}
              key={s.title}
            >
              <span>{i === 0 ? <Icon name="check" size={15} /> : i + 1}</span>
              <p>
                <b>{s.title}</b>
                <small>{s.status}</small>
              </p>
              {i === 1 && <em>Pending</em>}
            </div>
          ))}
        </Card>
        <Card className="approver">
          <div>
            <span>FM</span>
            <p>
              <b>Finance Manager — Acting Approver</b>
              <small>Click to simulate approval decision</small>
            </p>
          </div>
          <div className="decision-actions">
            <Button kind="success" onClick={() => n("/order-confirmed")}>
              <Icon name="check" size={15} />
              Approve
            </Button>
            <Button kind="warning">Request changes</Button>
            <Button kind="danger">Reject</Button>
          </div>
        </Card>
      </div>
      <aside>
        <Card className="amount">
          <h3>Amount</h3>
          <strong>$47,200</strong>
          <p>Within budget limit of $75,000</p>
          <i />
        </Card>
        <Card className="digital">
          <b>Digital approval</b>
          <p>This workflow replaces email chains and manual processes.</p>
        </Card>
      </aside>
    </div>
  );
}
