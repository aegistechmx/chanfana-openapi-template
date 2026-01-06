import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

// === START Hono APP ===
const app = new Hono<{ Bindings: Env }>();

// === MIDDLEWARE DE SEGURIDAD – antes de rutas ===
app.use("*", async (c, next) => {
  await next(); // Ejecuta la ruta primero

  // Cabeceras Hardening Pro
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // CSP ajustada para Swagger UI + GitHub Pages para logo
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self'; " +
    "img-src 'self' data: https://aegistechmx.github.io; " +
    "frame-ancestors 'self'; " +
    "upgrade-insecure-requests"
  );

  // Cabeceras nivel experto
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

// === SETUP OPENAPI con logo desde GitHub Pages ===
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

// === ANIMACIÓN DE LOGO CON CSS ===
// Esto se puede inyectar en tu HTML de docs (si tienes <style> global)
const logoCSS = `
<style>
  img[x-logo] {
    opacity: 0;
    animation: fadeIn 1s forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
`;

// Si tu docs tienen un middleware o HTML base, inyecta logoCSS ahí


// === RUTAS ===
// openapi.route("/tasks", tasksRouter);
// openapi.post("/dummy/:slug", DummyEndpoint);

// === EXPORT ===
export default app;
