import { fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

// 1. DECLARACIÓN ÚNICA DE APP
const app = new Hono();

// 2. MIDDLEWARE DE SEGURIDAD
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

// 3. SETUP OPENAPI
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "API para gestión de tareas 🚀",
      "x-logo": {
        url: "aegistechmx.github.io",
        altText: "AegisTechMX",
        backgroundColor: "#0a0a0a"
      },
    },
  },
});

// 4. REGISTRO DE ENDPOINTS
// Health check
openapi.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Dummy Endpoint (Clase)
openapi.post("/dummy/:slug", DummyEndpoint);

// Router de Tareas
openapi.route("/tasks", tasksRouter);

// 5. EXPORTACIÓN ÚNICA
export default app;
