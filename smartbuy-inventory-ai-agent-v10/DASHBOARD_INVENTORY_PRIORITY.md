# Dashboard Inventory Priority

The Dashboard now loads inventory records from `/api/inventory` and selects the highest-priority
risk for the featured inventory alert.

Risk priority:
- high = 3
- medium = 2
- low = 1

The existing Dashboard -> Recommendation -> Quote -> Approval -> Order flow is unchanged.
