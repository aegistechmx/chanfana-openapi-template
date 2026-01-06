import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskRead } from "./endpoints/tasks/taskRead";
import { TaskCreate } from "./endpoints/tasks/taskCreate";
import { TaskUpdate } from "./endpoints/tasks/taskUpdate";
import { TaskDelete } from "./endpoints/tasks/taskDelete";

const app = new Hono();

// --- MIDDLEWARE DE SEGURIDAD REFORZADO ---
app.use("*", async (c, next) => {
  await next();
  
  // Clonamos la respuesta y añadimos los headers de forma atómica
  const response = new Response(c.res.body, c.res);
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // CSP que permite el funcionamiento de Swagger UI
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://fastly.jsdelivr.net;");
  
  c.res = response;
});
// -----------------------------------------

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

openapi.get("/tasks", TaskRead);
openapi.post("/tasks", TaskCreate);
openapi.put("/tasks/:slug", TaskUpdate);
openapi.delete("/tasks/:slug", TaskDelete);

export default app;