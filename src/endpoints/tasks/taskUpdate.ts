import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class TaskUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Marcar tarea como completada",
    request: {
      params: z.object({
        slug: z.string().describe("El slug único de la tarea"),
      }),
    },
    responses: {
      "200": {
        description: "Tarea actualizada correctamente",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
    },
  };

  async handle(c: any) {
    // Validamos el parámetro 'slug' definido en el schema
    const data = await this.getValidatedData<typeof this.schema>();
    const { slug } = data.params;

    try {
      await c.env.DB.prepare("UPDATE tasks SET completed = 1 WHERE slug = ?")
        .bind(slug)
        .run();

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}