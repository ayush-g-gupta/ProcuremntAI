# SmartBuy Express API

Run the frontend and API in separate terminals:

```powershell
npm.cmd run server
npm.cmd run dev
```

The Vite proxy sends browser requests from `/api/*` to `http://localhost:4000`.

## Current endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service health check |
| GET | `/api/dashboard` | Dashboard inventory alert and summary metrics |
| GET | `/api/products?category=&search=` | Product catalog search/filter |
| GET | `/api/products/:sku` | Product details |
| GET | `/api/recommendations/current` | AI recommendation contract (currently deterministic demo data) |
| POST | `/api/quotes` | Create a quote from `{ "productSku": "BTMC-450", "quantity": 2500 }` |
| POST | `/api/quotes/:quoteId/submit` | Submit a draft quote to approval |
| GET | `/api/quotes/:quoteId` | Read a quote |
| GET | `/api/approvals/:approvalId` | Read an approval workflow |
| POST | `/api/approvals/:approvalId/decision` | Finance decision: `{ "decision": "approve" }` |
| GET | `/api/orders/:orderId` | Read a placed order |
| GET | `/api/orders?status=placed` | List/filter orders |
| PATCH | `/api/orders/:orderId/status` | Change valid order state: `placed → shipped/cancelled`, `shipped → delivered` |

## Minimal rules

The API is intentionally database-free for the prototype; its maps reset whenever the server restarts. It validates product IDs, quantities and permitted state changes. The only role restriction is the finance decision endpoint, which requires `x-user-role: finance`. Replace that header check with real authentication/authorization before deployment.

## Next production steps

Add a database, authenticated users, persistent audit records, supplier integrations, rate limiting, CORS allowlists, and a real AI/recommendation service. Keep the current route contracts so the React UI requires minimal change.


## Inventory AI configuration

The server is started from the project root with `node --env-file=.env server/index.js`, so the active `.env` file must be at the project root: `smartbuy_v2/.env`. Do not put the only copy in `server/.env`.

Required variables:
- `AI_PROVIDER=capgemini`
- `GENERATIVE_ENGINE_API_KEY`
- `GENERATIVE_ENGINE_BASE_URL`
- `GENERATIVE_ENGINE_MODEL`
- `GENERATIVE_ENGINE_CHAT_PATH`

The server logs `Capgemini AI configuration: loaded` when these required values are present.

Dashboard flow:
Dashboard -> Run/Review Inventory AI -> POST `/api/inventory/check` -> Recommendation -> Quote -> Approval -> Order confirmation.
