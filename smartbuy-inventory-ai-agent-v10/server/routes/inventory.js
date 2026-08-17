import { Router } from "express";
import { inventorySnapshots } from "../data/inventory.js";
import { runInventoryCheckAgent } from "../services/inventoryAgent.js";

export const inventoryRouter = Router();

inventoryRouter.get("/inventory", (req, res) => {
  res.json({ data: inventorySnapshots });
});

inventoryRouter.post("/inventory/check", async (req, res, next) => {
  try {
    const result = await runInventoryCheckAgent(req.body?.sku);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});
