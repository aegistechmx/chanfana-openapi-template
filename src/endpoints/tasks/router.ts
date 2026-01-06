import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class TaskList extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "List all tasks",
    responses: {
      "200": {
        description: "Ok",
        content: { "application/json": { schema: z.object({ tasks: z.array(z.any()) }) } },
      },
    },
  };

  async handle(c: any) {
    // Si quieres probar si la DB funciona, usa este bloque:
    try {
        const { results } = await c.env.DB.prepare("SELECT * FROM tasks").all();
        return { tasks: results };
    } catch (e) {
        return { tasks: [], error: "DB connection ok, but table empty or error" };
    }
  }
}