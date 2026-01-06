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
    // Usamos el binding DB que ya configuramos en la consola
    const { results } = await c.env.DB.prepare("SELECT * FROM tasks").all();
    return { tasks: results };
  }
}