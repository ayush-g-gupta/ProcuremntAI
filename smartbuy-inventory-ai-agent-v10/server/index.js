import { app } from "./app.js";
import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 4000;
app.listen(port, () => {
  const aiConfigured = Boolean(
    process.env.GENERATIVE_ENGINE_API_KEY &&
      process.env.GENERATIVE_ENGINE_BASE_URL &&
      process.env.GENERATIVE_ENGINE_MODEL,
  );


const distPath = path.resolve(__dirname, '..', 'dist');

// Serve the static Vite build assets
app.use(express.static(distPath));

// ❌ OLD CRASHING LINE: app.get('*', ...)
// ✅ NEW COMPATIBLE LINE: Use /(.*) to intercept modern deep-links safely
app.get('/(.*)', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

  console.log(`SmartBuy API listening on http://localhost:${port}`);
  console.log(`Capgemini AI configuration: ${aiConfigured ? "loaded" : "missing"}`);
});
