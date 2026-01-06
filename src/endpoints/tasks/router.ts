import { OpenAPIRoute, fromHono } from "chanfana";
import { Hono } from "hono";
import { z } from "zod";

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

// Definición de clase limpia
export class TaskList extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "List all tasks",
    responses: {
      "200": {
        description: "List of tasks",
        content: {
          "application/json": {
            schema: z.object({ tasks: z.array(TaskSchema) }),
          },
        },
      },
    },
  };

  async handle() {
    return {
      tasks: [{ id: "1", title: "Task 1", completed: false }],
    };
  }
}

// Registramos los endpoints en este router local
// No es estrictamente necesario usar fromHono aquí si el router se registra con openapi.route en el index
// pero ayuda a mantener el tipado local.
const tasksOpenapi = fromHono(tasks);
tasksOpenapi.get("/", TaskList);

export const tasksRouter = tasks;