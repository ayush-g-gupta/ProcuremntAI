import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFound } from "./middleware/errors.js";
import { productRouter } from "./routes/products.js";
import { procurementRouter } from "./routes/procurement.js";
import { inventoryRouter } from "./routes/inventory.js";

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "..", "dist");

app.use(express.json({ limit: "100kb" }));

// 1. API Routes
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "smartbuy-api" }));
app.use("/api/products", productRouter);
app.use("/api", procurementRouter);
app.use("/api", inventoryRouter);

// 2. Serve Frontend Production Assets
app.use(express.static(distPath));

// 3. FIX: Naye path-to-regexp ke liye sahi wildcard syntax
app.get("/:path*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// 4. Global Error Catchers
app.use(notFound);
app.use(errorHandler);
