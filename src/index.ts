import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskRead } from "./endpoints/tasks/taskRead";
import { TaskCreate } from "./endpoints/tasks/taskCreate";
import { TaskUpdate } from "./endpoints/tasks/taskUpdate";
import { TaskDelete } from "./endpoints/tasks/taskDelete";

const app = new Hono();

/**
 * MIDDLEWARE DE SEGURIDAD PARA GRADO A+
 * Configuración estricta de headers según estándares de Mozilla Observatory
 */
app.use("*", async (c, next) => {
  await next();
  
  // 1. HSTS (Strict-Transport-Security) - Requisito para A+
  // 2 años de duración, incluye subdominios y preparado para la lista de precarga
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  
  // 2. Anti-Clickjacking
  c.header("X-Frame-Options", "DENY");
  
  // 3. Bloqueo de detección de tipo MIME
  c.header("X-Content-Type-Options", "nosniff");
  
  // 4. Referrer Policy (Máxima privacidad)
  c.header("Referrer-Policy", "no-referrer");
  
  // 5. Permissions Policy (Bloqueo de sensores y APIs del navegador)
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), fullscreen=*, autoplay=*, interest-cohort=()");

  // 6. Content Security Policy (CSP)
  // Nota: 'unsafe-inline' en style-src es necesario para Swagger, 
  // pero intentamos mantener script-src sin 'unsafe-inline' para la A+.
  c.header(
    "Content-Security-Policy", 
    "default-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net; " + 
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "object-src 'none'; " +
    "img-src 'self' data: https://fastly.jsdelivr.net; " +
    "font-src 'self' https://cdn.jsdelivr.net; " +
    "media-src 'self' *; " + // Permitir videos/audio de cualquier origen
    "frame-src 'self' *; " + // Permitir iframes (necesario para YouTube/Vimeo)
    "connect-src 'self' *; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests;"
  );
});

/**
 * CONFIGURACIÓN DE CHANFANA (OpenAPI)
 */
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    openapi: "3.0.0",
    info: {
      title: "AegisTech API",
      version: "1.0.0",
      description: "API de gestión de tareas con seguridad Grado A+",
    },
  },
});

/**
 * REGISTRO DE RUTAS (CRUD)
 */
openapi.get("/tasks", TaskRead);
openapi.post("/tasks", TaskCreate);
openapi.put("/tasks/:slug", TaskUpdate);
openapi.delete("/tasks/:slug", TaskDelete);

export default app;
