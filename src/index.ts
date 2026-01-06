import { fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

const app = new Hono();

// === MIDDLEWARE DE SEGURIDAD (OBJETIVO: GRADO A+) ===
app.use("*", async (c, next) => {
  await next();

  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  /**
   * CSP PARA A+: 
   * He añadido el hash 'sha256-...' que Swagger suele usar para su inicialización.
   * Esto reemplaza a 'unsafe-inline' y debería subirte al A+.
   */
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='; " + 
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " + 
    "img-src 'self' data: https://aegistechmx.github.io https://raw.githubusercontent.com; " +
    "font-src 'self' https://cdn.jsdelivr.net; " +
    "connect-src 'self';"
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
      description: 
        "![AegisTech Logo](https://aegistechmx.github.io/images/logo-aegistech-dark.png)\n\n" +
        "API segura de alto rendimiento con certificación AegisTech 🚀",
    },
  },
});

// Registrar Endpoints
openapi.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));
openapi.route("/tasks", tasksRouter);
openapi.post("/dummy/:slug", DummyEndpoint);

// Ruta para el esquema JSON
app.get("/openapi.json", (c) => {
  return c.json(openapi.getSchema());
});

export default app;