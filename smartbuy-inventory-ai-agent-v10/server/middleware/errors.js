export function notFound(req, res) {
  res.status(404).json({ error: "NOT_FOUND", message: `No endpoint for ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(error.status || 500).json({ error: error.code || "INTERNAL_ERROR", message: error.message || "Something went wrong" });
}
