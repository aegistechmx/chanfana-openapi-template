import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

// Inicia la app Hono
const app = new Hono<{ Bindings: Env }>();

// === MIDDLEWARE DE SEGURIDAD – ANTES DE LAS RUTAS ===
app.use("*", async (c, next) => {
  await next();

  // Cabeceras de hardening pro
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // CSP básica para Swagger UI
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self'; " +
    "img-src 'self' data: https://raw.githubusercontent.com https://aegistechmx.github.io; " +
    "frame-ancestors 'self'; " +
    "upgrade-insecure-requests"
  );

  // Cabeceras avanzadas
  c.header("Cross-Origin-Embedder-Policy", "require-corp");
  c.header("Cross-Origin-Opener-Policy", "same-origin");
  c.header("Cross-Origin-Resource-Policy", "same-origin");
});

// === MANEJADOR GLOBAL DE ERRORES ===
app.onError((err, c) => {
  if (err instanceof ApiException) {
    return c.json({ success: false, errors: err.buildResponse() }, err.status as ContentfulStatusCode);
  }
  console.error("Error global atrapado:", err);
  return c.json({ success: false, errors: [{ code: 7000, message: "Internal Server Error" }] }, 500);
});

// === SETUP OPENAPI CON LOGO DIRECTO ===
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    info: {
      title: "Mi API Segura Pro",
      version: "2.0.0",
      description: "Ciberseguridad con Cloudflare Workers 🐔💪",
      "x-logo": {
        url: "https://aegistechmx.github.io/images/logo-aegistech-dark.png",
        altText: "AegisTechMX",
        backgroundColor: "#0a0a0a"
      },
    },
  },
});

// === RUTAS ===
openapi.route("/tasks", tasksRouter);
openapi.post("/dummy/:slug", DummyEndpoint);

// === EXPORTAR APP ===
export default app;
