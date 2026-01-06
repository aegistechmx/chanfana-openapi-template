import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// === MIDDLEWARE DE SEGURIDAD – PONLO AQUÍ ARRIBA, ANTES DE LAS RUTAS ===
app.use("*", async (c, next) => {
  await next(); // Ejecuta la ruta primero

  // Cabeceras de hardening pro
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // CSP ajustada para Swagger UI (necesita 'unsafe-inline' y 'unsafe-eval' por ahora)
  c.header("Content-Security-Policy",
  "default-src 'self'; " +
  "script-src 'self'; " +
  "style-src 'self'; " +
  "img-src 'self' data: https://aegistechmx.github.io; " +
  "frame-ancestors 'self'; " +
  "upgrade-insecure-requests"
);

  // Upcoming headers (nivel experto)
  c.header("Cross-Origin-Embedder-Policy", "require-corp");
  c.header("Cross-Origin-Opener-Policy", "same-origin");
  c.header("Cross-Origin-Resource-Policy", "same-origin");
});

// === MANEJADOR DE ERRORES ===
app.onError((err, c) => {
  if (err instanceof ApiException) {
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode
    );
  }
  console.error("Global error handler caught:", err);
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: "Internal Server Error" }],
    },
    500
  );
});

// === SETUP OPENAPI ===
  const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    info: {
      title: "AegisTechMX Secure API",
      version: "2.0.0",
      description: "API segura con hardening completo y estándares enterprise",
      "x-logo": {
        url: "https://aegistechmx.github.io/imagess/logo.png",
        altText: "AegisTechMX",
        backgroundColor: "#0b0f1a"
      }
    },
  },
});


// === RUTAS ===
// === openapi.route("/tasks", tasksRouter);
// === openapi.post("/dummy/:slug", DummyEndpoint);

// === EXPORT ===
export default app;
