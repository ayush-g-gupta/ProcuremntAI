import { Router } from "express";
import { approvals, nextId, orders, products, quotes } from "../data/store.js";

export const procurementRouter = Router();

procurementRouter.get("/dashboard", (req, res) => res.json({ data: { inventoryRisk: { productSku: "BTMC-450", currentInventory: 3200, safetyStock: 1000, forecastDemand: 2500, daysUntilRisk: 14 }, metrics: { openOrders: 12, pendingApprovals: 3, activeQuotes: 5, potentialSavings: 48600 } } }));

procurementRouter.get("/recommendations/current", (req, res) => {
  const product = products.find((item) => item.sku === "BTMC-450");
  res.json({ data: { product, quantity: 2500, confidence: 94, reasons: ["Meets all technical requirements", "3,200 units currently available", "8-day delivery — within your window", "Existing supplier relationship"], risks: { procurement: "low", delivery: "low", technical: "low", cost: "competitive" } } });
});

procurementRouter.post("/quotes", (req, res) => {
  const { productSku, quantity } = req.body;
  const product = products.find((item) => item.sku === String(productSku || "").toUpperCase());
  const numericQuantity = Number(quantity);
  if (!product) return res.status(400).json({ error: "INVALID_PRODUCT", message: "A valid productSku is required" });
  if (!Number.isInteger(numericQuantity) || numericQuantity < 1) return res.status(400).json({ error: "INVALID_QUANTITY", message: "quantity must be a positive whole number" });
  if (numericQuantity > product.availability) return res.status(400).json({ error: "INSUFFICIENT_STOCK", message: "Requested quantity exceeds current availability" });
  const subtotal = product.price * numericQuantity;
  const quote = { id: nextId("SB"), productSku: product.sku, quantity: numericQuantity, subtotal, shipping: 1200, total: subtotal + 1200, savings: Math.round(subtotal * 0.075), status: "draft", createdAt: new Date().toISOString() };
  quotes.set(quote.id, quote);
  return res.status(201).json({ data: quote });
});

procurementRouter.get("/quotes/:quoteId", (req, res) => {
  const quote = quotes.get(req.params.quoteId);
  if (!quote) return res.status(404).json({ error: "QUOTE_NOT_FOUND", message: "Quote does not exist" });
  return res.json({ data: quote });
});

procurementRouter.post("/quotes/:quoteId/submit", (req, res) => {
  const quote = quotes.get(req.params.quoteId);
  if (!quote) return res.status(404).json({ error: "QUOTE_NOT_FOUND", message: "Quote does not exist" });
  if (quote.status !== "draft") return res.status(409).json({ error: "INVALID_QUOTE_STATE", message: "Only draft quotes can be submitted" });
  quote.status = "submitted";
  const approval = { id: nextId("APR"), quoteId: quote.id, status: "pending_finance", steps: [{ name: "Procurement review", status: "approved" }, { name: "Finance approval", status: "pending" }, { name: "Final approval", status: "not_started" }], createdAt: new Date().toISOString() };
  approvals.set(approval.id, approval);
  return res.status(201).json({ data: approval });
});

procurementRouter.get("/approvals/:approvalId", (req, res) => {
  const approval = approvals.get(req.params.approvalId);
  if (!approval) return res.status(404).json({ error: "APPROVAL_NOT_FOUND", message: "Approval does not exist" });
  return res.json({ data: approval });
});

procurementRouter.post("/approvals/:approvalId/decision", (req, res) => {
  if (req.header("x-user-role") !== "finance") return res.status(403).json({ error: "FINANCE_ROLE_REQUIRED", message: "Set x-user-role: finance to record this decision" });
  const approval = approvals.get(req.params.approvalId);
  const decision = req.body?.decision;
  if (!approval) return res.status(404).json({ error: "APPROVAL_NOT_FOUND", message: "Approval does not exist" });
  if (!["approve", "request_changes", "reject"].includes(decision)) return res.status(400).json({ error: "INVALID_DECISION", message: "decision must be approve, request_changes, or reject" });
  if (approval.status !== "pending_finance") return res.status(409).json({ error: "INVALID_APPROVAL_STATE", message: "Finance approval is no longer pending" });
  approval.steps[1].status = decision === "approve" ? "approved" : decision;
  approval.status = decision === "approve" ? "approved" : decision;
  if (decision === "approve") {
    approval.steps[2].status = "approved";
    const quote = quotes.get(approval.quoteId);
    const product = products.find((item) => item.sku === quote.productSku);
    const order = { id: nextId("PO"), quoteId: quote.id, approvalId: approval.id, productSku: quote.productSku, quantity: quote.quantity, supplier: product.supplier, status: "placed", total: quote.total, estimatedDelivery: "2026-08-24", createdAt: new Date().toISOString() };
    orders.set(order.id, order);
    approval.orderId = order.id;
  }
  return res.json({ data: approval });
});

procurementRouter.get("/orders", (req, res) => {
  const { status } = req.query;
  const list = [...orders.values()].filter((order) => !status || status === "all" || order.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ data: list, meta: { count: list.length } });
});

procurementRouter.get("/orders/:orderId", (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) return res.status(404).json({ error: "ORDER_NOT_FOUND", message: "Order does not exist" });
  return res.json({ data: order });
});

procurementRouter.patch("/orders/:orderId/status", (req, res) => {
  const order = orders.get(req.params.orderId);
  const status = req.body?.status;
  if (!order) return res.status(404).json({ error: "ORDER_NOT_FOUND", message: "Order does not exist" });
  const allowed = { placed: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [] };
  if (!allowed[order.status].includes(status)) return res.status(409).json({ error: "INVALID_ORDER_STATE", message: `Cannot change ${order.status} to ${status}` });
  order.status = status;
  order.updatedAt = new Date().toISOString();
  return res.json({ data: order });
});
