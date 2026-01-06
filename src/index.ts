import { fromHono, OpenAPIRoute } from "chanfana";
import { Hono } from "hono";
import { TaskRead } from "./endpoints/tasks/taskRead";

const app = new Hono();

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

// Registramos solo lo básico para probar
openapi.get("/tasks", TaskRead);

export default app;