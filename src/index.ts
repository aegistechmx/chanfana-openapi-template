import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskList } from "./endpoints/tasks/router"; // Importa la CLASE directamente
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
    },
  },
});


openapi.get("/tasks", TaskList); 
openapi.post("/dummy/:slug", DummyEndpoint);
openapi.get("/health", (c) => c.json({ status: "ok" }));

export default app;