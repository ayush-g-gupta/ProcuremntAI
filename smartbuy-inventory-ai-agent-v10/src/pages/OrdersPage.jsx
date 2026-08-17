import { useEffect, useState } from "react";
import { Card, Button } from "../components/UI";
const demo = [
  {
    id: "PO-2026-08452",
    productSku: "BTMC-450",
    quantity: 2500,
    supplier: "EV Components Manufacturing",
    total: 47200,
    status: "shipped",
    estimatedDelivery: "2026-08-24",
  },
  {
    id: "PO-2026-08100",
    productSku: "HV-CONN-48",
    quantity: 1000,
    supplier: "Connectix",
    total: 8200,
    status: "placed",
    estimatedDelivery: "2026-08-28",
  },
];
export function OrdersPage() {
  const [orders, setOrders] = useState(demo);
  const [filter, setFilter] = useState("all");
  const load = () =>
    fetch(`/api/orders?status=${filter}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((r) => setOrders(r.data))
      .catch(() =>
        setOrders(
          filter === "all" ? demo : demo.filter((x) => x.status === filter),
        ),
      );
  useEffect(load, [filter]);
  const update = (id, status) =>
    fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(load);
  return (
    <div className="order-center">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">PROCUREMENT OPERATIONS</p>
          <h1>Manage orders</h1>
          <p>Track supplier fulfilment and update delivery status.</p>
        </div>
      </div>
      <div className="order-toolbar">
        <div className="catalog-tabs">
          {["all", "placed", "shipped", "delivered", "cancelled"].map((x) => (
            <button
              className={filter === x ? "selected" : ""}
              onClick={() => setFilter(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="orders-list">
        {orders.map((o) => (
          <Card className="order-row" key={o.id}>
            <div className="order-main">
              <div>
                <b>{o.id}</b>
                <p>
                  {o.productSku} · {o.quantity.toLocaleString()} units
                </p>
                <small>{o.supplier}</small>
              </div>
            </div>
            <div>
              <small>Estimated delivery</small>
              <b>{o.estimatedDelivery}</b>
            </div>
            <div>
              <small>Total amount</small>
              <b>${o.total.toLocaleString()}</b>
            </div>
            <span className={`status ${o.status}`}>{o.status}</span>
            <div className="order-actions">
              {o.status === "placed" && (
                <>
                  <Button onClick={() => update(o.id, "shipped")}>
                    Mark shipped
                  </Button>
                  <Button
                    kind="danger"
                    onClick={() => update(o.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {o.status === "shipped" && (
                <Button
                  kind="success"
                  onClick={() => update(o.id, "delivered")}
                >
                  Mark delivered
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
