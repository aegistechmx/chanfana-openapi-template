import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskList } from "./endpoints/tasks/router"; 
import { DummyEndpoint } from "./endpoints/dummyEndpoint"; 

// 1. Inicializar Hono estándar
const app = new Hono();

// 2. Configurar Seguridad Grado A+
app.use("*", async (c, next) => {
  await next();
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // CSP actualizado con connect-src para evitar errores de red en Swagger
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net 'sha256-k50uV4UJTsLb556/ssV/UqPtQnzt3a3VxHTxwJ0rxYo='; " + 
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " + 
    "img-src 'self' data: https://aegistechmx.github.io https://raw.githubusercontent.com; " + 
    "font-src 'self' https://cdn.jsdelivr.net; " + 
    "connect-src 'self' https://cdn.jsdelivr.net;"
  );
});

// 3. Crear el envoltorio de OpenAPI
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    openapi: "3.0.0",
    info: {
      title: "AegisTech API",
      version: "1.0.0",
      description: "![Logo](https://aegistechmx.github.io/images/logo-aegistech-dark.png)\n\n API Segura",
    },
  },
});

// 4. REGISTRO DIRECTO: Esto evita el bucle que causa el Error 500
openapi.get("/tasks", TaskList);
openapi.post("/dummy/:slug", DummyEndpoint);

export default app;