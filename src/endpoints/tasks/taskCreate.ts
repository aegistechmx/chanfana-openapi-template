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
              result: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string(),
                description: z.string().nullable(),
                completed: z.number(),
                due_date: z.string().nullable(),
              }),
            }),
          },
        },
      },
      "400": {
        description: "Error de validación o de base de datos",
        content: {
          "application/json": {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
      "500": {
        description: "Error interno del servidor",
        content: {
          "application/json": {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
    },
  };

  async handle(c: any) {
    try {
      const data = await this.getValidatedData<typeof this.schema>();
      const task = data.body;
      
      // Usamos valores por defecto para los opcionales para evitar nulos accidentales
      const description = task.description || "";
      const due_date = task.due_date || new Date().toISOString().split('T')[0];

      const { results } = await c.env.DB.prepare(
        "INSERT INTO tasks (name, slug, description, completed, due_date) VALUES (?, ?, ?, 0, ?) RETURNING *"
      )
        .bind(task.name, task.slug, description, due_date)
        .run();

      if (!results || results.length === 0) {
        return c.json({ success: false, error: "Failed to create task" }, 500);
      }

      return c.json(
        {
          success: true,
          result: results[0],
        },
        201,
      );
    } catch (error: any) {
      // Si la base de datos falla (ej. slug duplicado), devolvemos un error controlado
      return c.json({ success: false, error: error.message }, 400);
    }
  }
}