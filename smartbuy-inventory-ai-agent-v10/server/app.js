import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFound } from "./middleware/errors.js";
import { productRouter } from "./routes/products.js";
import { procurementRouter } from "./routes/procurement.js";
import { inventoryRouter } from "./routes/inventory.js";
import { chatbotRouter } from "./routes/chatbot.js";

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "..", "dist");

app.use(express.json({ limit: "100kb" }));

// 1. All API Routes
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "smartbuy-api" }));
app.use("/api/products", productRouter);
app.use("/api", procurementRouter);
app.use("/api", inventoryRouter);
app.use("/api", chatbotRouter);

// 2. Serve Frontend Production Assets
app.use(express.static(distPath));

// 3. FIX: Standard structural middleware configuration for React Router deep links
// Bina kisi regex pattern parameters ke, ye Express v5 mein crash ho hi nahi sakta
app.use((req, res, next) => {
  // Agar request API route nahi hai, to direct index.html return karo
  if (!req.url.startsWith('/api')) {
    return res.sendFile(path.join(distPath, "index.html"));
  }
  next();
});

// 4. Global Error Catchers (Only for API Route mismatches or actual errors)
app.use(notFound);
app.use(errorHandler);
