import { app } from "./app.js";
import path from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 4000;
app.listen(port, () => {
  const aiConfigured = Boolean(
    process.env.GENERATIVE_ENGINE_API_KEY &&
      process.env.GENERATIVE_ENGINE_BASE_URL &&
      process.env.GENERATIVE_ENGINE_MODEL,
  );



// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------------------
// 1. YOUR API ENDPOINTS (Keep them at the top)
// ----------------------------------------------------


// ----------------------------------------------------
// 2. PRODUCTION FRONTEND SERVING
// ----------------------------------------------------
// Resolve the path to the 'dist' folder at the root level
const distPath = path.resolve(__dirname, '..', 'dist');

// Serve the static Vite build assets
app.use(express.static(distPath));

// Fallback catch-all handler for React Router links
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});



  console.log(`SmartBuy API listening on http://localhost:${port}`);
  console.log(`Capgemini AI configuration: ${aiConfigured ? "loaded" : "missing"}`);
});
