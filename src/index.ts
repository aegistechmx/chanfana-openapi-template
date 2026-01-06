import { fromHono } from "chanfana";
import { Hono } from "hono";

// Inicia la app Hono
const app = new Hono();

// === MIDDLEWARE DE SEGURIDAD ===
app.use("*", async (c, next) => {
  await next();

  // Cabeceras de seguridad
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // CSP para Swagger UI
  c.header(
    "Content-Security-Policy",
    "default-src 'self' https://cdn.jsdelivr.net; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https://aegistechmx.github.io; " +
    "font-src 'self' https://cdn.jsdelivr.net;"
  );
});

// === SETUP OPENAPI ===
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "API para gestión de tareas 🚀",
      "x-logo": {
        url: "https://aegistechmx.github.io/images/logo-aegistech-dark.png",
        altText: "AegisTechMX",
        backgroundColor: "#0a0a0a"
      },
    },
    tags: [
      { name: "Tasks", description: "Operaciones con tareas" },
      { name: "System", description: "Endpoints del sistema" }
    ]
  },
});

// === HEALTH CHECK ===
openapi.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// === IMPORTAR Y REGISTRAR ENDPOINTS ===
import { tasksRouter } from "./endpoints/tasks/router";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

// Registrar endpoints
openapi.route("/tasks", tasksRouter);
openapi.post("/dummy/:slug", DummyEndpoint);

// === EXPORTAR ===
// INCORRECTO: export default openapi.router;
// CORRECTO:
export default app;
