import { Router } from "express";
import { products } from "../data/store.js";

export const productRouter = Router();

productRouter.get("/", (req, res) => {
  const { category, search } = req.query;
  let result = products;
  if (category && category !== "All Products") result = result.filter((product) => product.category.toLowerCase() === category.toLowerCase());
  if (search) {
    const term = search.toLowerCase();
    result = result.filter((product) => `${product.sku} ${product.name} ${product.supplier}`.toLowerCase().includes(term));
  }
  res.json({ data: result, meta: { count: result.length } });
});

productRouter.get("/:sku", (req, res) => {
  const product = products.find((item) => item.sku === req.params.sku.toUpperCase());
  if (!product) return res.status(404).json({ error: "PRODUCT_NOT_FOUND", message: "Product does not exist" });
  return res.json({ data: product });
});
