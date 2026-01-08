import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class TaskGet extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Obtener una tarea por su slug",
    request: {
      params: z.object({
        slug: z.string().describe("El slug único de la tarea"),
      }),
    },
    responses: {
      "200": {
        description: "Tarea encontrada",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              result: z.any(), // Se puede definir un esquema de tarea más específico aquí
            }),
          },
        },
      },
      "404": {
        description: "Tarea no encontrada",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: any) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { slug } = data.params;

    const task = await c.env.DB.prepare("SELECT * FROM tasks WHERE slug = ?")
      .bind(slug)
      .first();

    if (!task) {
      return c.json({ success: false, error: "Not Found" }, 404);
    }

    return c.json({ success: true, result: task });
  }
}