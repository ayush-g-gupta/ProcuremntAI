import express from "express";
import { errorHandler, notFound } from "./middleware/errors.js";
import { productRouter } from "./routes/products.js";
import { procurementRouter } from "./routes/procurement.js";
import { inventoryRouter } from "./routes/inventory.js";

export const app = express();
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "smartbuy-api" }));
app.use("/api/products", productRouter);
app.use("/api", procurementRouter);
app.use("/api", inventoryRouter);
app.use(notFound);
app.use(errorHandler);
