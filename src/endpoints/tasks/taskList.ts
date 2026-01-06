import { createEndpoint } from "chanfana";
import { z } from "zod";

export const TaskList = createEndpoint({
  method: "get",
  path: "/",
  responses: {
    200: z.object({
      tasks: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          completed: z.boolean(),
        })
      ),
    }),
  },
  handler: async (c) => {
    return c.json({
      tasks: [
        { id: "1", title: "Task 1", completed: false },
        { id: "2", title: "Task 2", completed: true },
      ],
    }, 200);
  },
  metadata: {
    tags: ["Tasks"],
    summary: "List all tasks",
    description: "Returns a list of tasks",
  },
});