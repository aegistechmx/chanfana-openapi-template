import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

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
