import { fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

const app = new Hono();

// === MIDDLEWARE DE SEGURIDAD ===
app.use("*", async (c, next) => {
  await next();
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
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
  },
});

// === REGISTRO DE ENDPOINTS ===

// 1. Health check directo
openapi.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. Dummy Endpoint (Clase)
openapi.post("/dummy/:slug", DummyEndpoint);

// 3. Router de Tareas (Importado)
// IMPORTANTE: Usamos app.route para integrar el router externo
app.route("/tasks", tasksRouter);

export default app;
