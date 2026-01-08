import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class TaskDelete extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Eliminar tarea",
    request: { params: z.object({ slug: z.string() }) },
    responses: {
      "200": {
        description: "OK",
        content: { "application/json": { schema: z.object({ success: z.boolean() }) } },
      },
      "404": {
        description: "Tarea no encontrada",
        content: {
          "application/json": {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
    },
  };

  async handle(c: any) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { slug } = data.params;

    const info = await c.env.DB.prepare("DELETE FROM tasks WHERE slug = ?").bind(slug).run();

    if (info.meta.changes === 0) {
      return c.json({ success: false, error: "Task not found" }, 404);
    }

    return c.json({ success: true });
  }
}