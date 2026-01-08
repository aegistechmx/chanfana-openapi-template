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

      const { results } = await c.env.DB.prepare(
        "INSERT INTO tasks (name, slug, description, completed, due_date) VALUES (?, ?, ?, 0, ?) RETURNING *"
      )
        .bind(task.name, task.slug, task.description, task.due_date)
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
      if (error instanceof z.ZodError) {
        return c.json({ success: false, error: error.message }, 400);
      }
      // Re-throw other errors to be caught by a global error handler
      // or to be handled as a 500 Internal Server Error
      throw error;
    }
  }
}