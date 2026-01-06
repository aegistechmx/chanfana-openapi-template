import { fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

const app = new Hono();

// === SEGURIDAD DE GRADO A+ ===
app.use("*", async (c, next) => {
  await next();
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // CSP usando TU Hash específico para evitar la pantalla en blanco
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net 'sha256-k50uV4UJTsLb556/ssV/UqPtQnzt3a3VxHTxwJ0rxYo='; " + 
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " + 
    "img-src 'self' data: https://aegistechmx.github.io https://raw.githubusercontent.com; " +
    "font-src 'self' https://cdn.jsdelivr.net; " +
    "connect-src 'self';"
  );
});

// === CONFIGURACIÓN OPENAPI ===
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "![Logo](https://aegistechmx.github.io/images/logo-aegistech-dark.png)\n\n API Segura AegisTech 🚀",
    },
  },
});

// Registrar rutas
openapi.route("/tasks", tasksRouter);
openapi.post("/dummy/:slug", DummyEndpoint);

// === FIX ERROR 500: Ruta manual para el esquema ===
app.get("/openapi.json", (c) => {
  return c.json(openapi.getSchema());
});

export default app;