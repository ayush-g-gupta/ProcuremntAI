import { Link } from "react-router-dom";
import { Button } from "../components/UI";
import { Icon } from "../components/Icon";
export function OrderConfirmedPage() {
  return (
    <section className="success-card">
      <div className="success-icon">
        <Icon name="check" size={38} />
      </div>
      <p className="eyebrow">PURCHASE APPROVED</p>
      <h1>Order approved and placed</h1>
      <p>
        Your purchase order has been sent to EV Components Manufacturing.
        Delivery is confirmed for 24 Aug 2026.
      </p>
      <div className="order-reference">
        <span>Purchase order</span>
        <b>PO-2026-08452</b>
        <span>Total amount</span>
        <b>$47,200</b>
      </div>
      <div className="confirmation">
        <Icon name="cube" size={20} />
        <div>
          <b>BTMC-450 · 2,500 units</b>
          <small>Battery Thermal Management Module</small>
        </div>
        <span>
          Estimated delivery
          <br />
          <b>24 Aug 2026</b>
        </span>
      </div>
      <Link className="button" to="/orders">
        Manage orders <Icon name="arrow" size={15} />
      </Link>
    </section>
  );
}
