# Inventory Data Flow

The Dashboard inventory card should use the inventory API as its source of truth.

Flow:
Dashboard -> GET /api/inventory -> selected/default inventory snapshot -> display metrics
Dashboard AI Check -> POST /api/inventory/check -> same SKU -> AI result

The product SKU remains the link between the product catalog and inventory data.
The original Dashboard -> Recommendation -> Quote -> Approval -> Order flow is unchanged.

Demo stakeholder name updated:
Priya Sharma -> Sophie Anderson
