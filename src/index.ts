import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskRead } from "./endpoints/tasks/taskRead";
import { TaskCreate } from "./endpoints/tasks/taskCreate";
// import { TaskUpdate } from "./endpoints/tasks/taskUpdate";
// import { TaskDelete } from "./endpoints/tasks/taskDelete";

const app = new Hono();

// 1. MIDDLEWARE DE SEGURIDAD (Sin romper el objeto Response)
app.use("*", async (c, next) => {
  await next();
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // CSP optimizado para que Swagger pueda "conectar" con el JSON
  c.header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://fastly.jsdelivr.net; connect-src 'self' *;");
});

// 2. CONFIGURACIÓN DE CHANFANA
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    openapi: "3.0.0",
    info: {
      title: "AegisTech API",
      version: "1.0.0",
    },
  },
});

// 3. RUTAS
openapi.get("/tasks", TaskRead);
openapi.post("/tasks", TaskCreate);
openapi.put("/tasks/:slug", TaskUpdate);
openapi.delete("/tasks/:slug", TaskDelete);

// 4. EXPORT SIMPLE (Fundamental para Workers y Chanfana)
export default app;