import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskList } from "./endpoints/tasks/router";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

const app = new Hono();

// === MIDDLEWARE DE SEGURIDAD (Headers / Heaters) ===
app.use("*", async (c, next) => {
  await next();

  // Cabeceras de seguridad estándar
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // CSP corregido para permitir Swagger UI, Logo y Fetch interno
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https://aegistechmx.github.io; " +
    "connect-src 'self'; " + // Vital para cargar openapi.json
    "font-src 'self' https://cdn.jsdelivr.net;"
  );
});

// === CONFIGURACIÓN DE CHANFANA (OpenAPI) ===
const openapi = fromHono(app, {
  docs_url: "/", // Swagger UI en la raíz
  schema: {
    openapi: "3.0.0",
    info: {
      title: "AegisTech Task API",
      version: "1.0.0",
      description: "Gestión de tareas con Cloudflare Workers y D1 🚀",
      "x-logo": {
        url: "aegistechmx.github.io",
        altText: "AegisTechMX",
        backgroundColor: "#0a0a0a"
      },
    },
  },
});

// === REGISTRO PLANO DE ENDPOINTS ===
// Usar openapi.get/post directamente evita el error 500 de 'parent'
openapi.get("/health", (c) => c.json({ status: "ok", time: new Date().toISOString() }));
openapi.get("/tasks", TaskList);
openapi.post("/dummy/:slug", DummyEndpoint);

export default app;
