import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskList } from "./endpoints/tasks/router";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

const app = new Hono();

// Middleware de Seguridad (Hono puro)
app.use("*", async (c, next) => {
  await next();
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
});

// Setup Chanfana
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "API corregida 2026",
    },
  },
});

// REGISTRO PLANO (Evita el error 'parent')
openapi.get("/health", (c) => c.json({ status: "ok" }));
openapi.get("/tasks", TaskList); // Registro directo de la clase
openapi.post("/dummy/:slug", DummyEndpoint); // Registro directo de la clase

export default app;
