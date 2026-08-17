export const products = [
  { sku: "BTMC-450", name: "Battery Thermal Management Module", category: "Battery Thermal", price: 18.4, availability: 3200, leadTimeDays: 8, sustainability: "A", supplierRating: 94, supplier: "EV Components Manufacturing", recommended: true },
  { sku: "BTMC-520", name: "Battery Thermal Management Module Pro", category: "Battery Thermal", price: 21.6, availability: 1100, leadTimeDays: 14, sustainability: "B+", supplierRating: 88, supplier: "VoltCore Systems" },
  { sku: "BTMC-410", name: "Battery Thermal Management Module Lite", category: "Battery Thermal", price: 15.8, availability: 700, leadTimeDays: 7, sustainability: "B", supplierRating: 82, supplier: "ThermoDrive Ltd." },
  { sku: "BATT-CTL-220", name: "Battery Control Unit 220A", category: "Control Units", price: 42, availability: 860, leadTimeDays: 11, sustainability: "A-", supplierRating: 91, supplier: "EV Components Manufacturing" },
  { sku: "HV-CONN-48", name: "High Voltage Connector 48V", category: "Connectors", price: 8.2, availability: 4500, leadTimeDays: 5, sustainability: "B+", supplierRating: 89, supplier: "Connectix" },
  { sku: "BMS-CORE-12", name: "BMS Core Module 12S", category: "Control Units", price: 95.5, availability: 320, leadTimeDays: 18, sustainability: "A", supplierRating: 93, supplier: "Battery Systems Europe" },
  { sku: "BTMC-600", name: "Battery Thermal Management Module Max", category: "Battery Thermal", price: 24.8, availability: 1450, leadTimeDays: 9, sustainability: "A-", supplierRating: 96, supplier: "ThermoDrive Ltd." },
  { sku: "BMS-CORE-24", name: "BMS Core Module 24S", category: "Control Units", price: 112.5, availability: 1850, leadTimeDays: 10, sustainability: "A", supplierRating: 95, supplier: "Battery Systems Europe" },
  { sku: "HV-CONN-72", name: "High Voltage Connector 72V", category: "Connectors", price: 11.6, availability: 980, leadTimeDays: 12, sustainability: "B+", supplierRating: 87, supplier: "Connectix" },
  { sku: "PWR-INV-300", name: "Power Inverter Controller 300A", category: "Power Electronics", price: 68.2, availability: 420, leadTimeDays: 16, sustainability: "B", supplierRating: 84, supplier: "VoltCore Systems" },
];

export const quotes = new Map();
export const approvals = new Map();
export const orders = new Map([
  ["PO-2026-08452", { id: "PO-2026-08452", quoteId: "SB-2026-08452", productSku: "BTMC-450", quantity: 2500, supplier: "EV Components Manufacturing", total: 47200, status: "shipped", estimatedDelivery: "2026-08-24", createdAt: "2026-08-14T08:30:00.000Z" }],
  ["PO-2026-08100", { id: "PO-2026-08100", quoteId: "SB-2026-08100", productSku: "HV-CONN-48", quantity: 1000, supplier: "Connectix", total: 8200, status: "placed", estimatedDelivery: "2026-08-28", createdAt: "2026-08-12T08:30:00.000Z" }],
  ["PO-2026-07824", { id: "PO-2026-07824", quoteId: "SB-2026-07824", productSku: "BATT-CTL-220", quantity: 480, supplier: "EV Components Manufacturing", total: 20160, status: "delivered", estimatedDelivery: "2026-08-10", createdAt: "2026-08-01T08:30:00.000Z" }],
]);

export function nextId(prefix) {
  return `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}
