import { app } from "./app.js";

const port = process.env.PORT || 4000;
app.listen(port, () => {
  const aiConfigured = Boolean(
    process.env.GENERATIVE_ENGINE_API_KEY &&
      process.env.GENERATIVE_ENGINE_BASE_URL &&
      process.env.GENERATIVE_ENGINE_MODEL,
  );

const path = require('path');

// Resolve the absolute path to the 'dist' folder located at the root
const distPath = path.resolve(__dirname, '..', 'dist');

// Serve the compiled HTML, CSS, and JS assets
app.use(express.static(distPath));

// Fallback wildcard handler for React Router client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});


  console.log(`SmartBuy API listening on http://localhost:${port}`);
  console.log(`Capgemini AI configuration: ${aiConfigured ? "loaded" : "missing"}`);
});
