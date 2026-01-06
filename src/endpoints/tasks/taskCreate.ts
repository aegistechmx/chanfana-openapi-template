import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class TaskCreate extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Crear una nueva tarea",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().describe("Nombre de la tarea"),
              slug: z.string().describe("Identificador único (slug)"),
              description: z.string().optional().describe("Descripción opcional"),
              due_date: z.string().optional().describe("Fecha de vencimiento"),
            }),
          },
        },
      },
    },
    responses: {
      "201": {
        description: "Tarea creada exitosamente",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: any) {
    try {
      const data = await c.req.valid("json");
      
      // Usamos valores por defecto para los opcionales para evitar nulos accidentales
      const description = data.description || "";
      const due_date = data.due_date || new Date().toISOString().split('T')[0];

      await c.env.DB.prepare(
        "INSERT INTO tasks (name, slug, description, completed, due_date) VALUES (?, ?, ?, 0, ?)"
      )
        .bind(data.name, data.slug, description, due_date)
        .run();

      return { 
        success: true,
        message: "Tarea creada en AegisTech"
      };
    } catch (error: any) {
      // Si la base de datos falla (ej. slug duplicado), devolvemos un error controlado
      return c.json({ success: false, error: error.message }, 400);
    }
  }
}