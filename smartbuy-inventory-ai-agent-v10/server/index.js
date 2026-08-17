import { app } from "./app.js";

const port = process.env.PORT || 4000;
app.listen(port, () => {
  const aiConfigured = Boolean(
    process.env.GENERATIVE_ENGINE_API_KEY &&
      process.env.GENERATIVE_ENGINE_BASE_URL &&
      process.env.GENERATIVE_ENGINE_MODEL,
  );

  console.log(`SmartBuy API listening on http://localhost:${port}`);
  console.log(`Capgemini AI configuration: ${aiConfigured ? "loaded" : "missing"}`);
});
