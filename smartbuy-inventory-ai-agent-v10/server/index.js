import { app } from "./app.js";

const port = process.env.PORT || 4000;
app.listen(port, () => {
  const aiConfigured = Boolean(
    process.env.GENERATIVE_ENGINE_API_KEY &&
      process.env.GENERATIVE_ENGINE_BASE_URL &&
      process.env.GENERATIVE_ENGINE_MODEL,
  );

  
  app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

  console.log(`SmartBuy API listening on http://localhost:${port}`);
  console.log(`Capgemini AI configuration: ${aiConfigured ? "loaded" : "missing"}`);
});
