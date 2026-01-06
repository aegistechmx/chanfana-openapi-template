import { createEndpoint } from "chanfana";
import { Hono } from "hono";
import { z } from "zod";

// Esquema común
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

// Task List
const TaskList = createEndpoint({
  method: "get" as const,
  path: "/",
  responses: {
    200: z.object({
      tasks: z.array(TaskSchema),
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
  },
});

// Task Create
const TaskCreate = createEndpoint({
  method: "post" as const,
  path: "/",
  request: {
    body: z.object({
      title: z.string().min(1),
      completed: z.boolean().optional().default(false),
    }),
  },
  responses: {
    201: TaskSchema,
  },
  handler: async (c) => {
    const body = c.req.valid("json");
    return c.json({
      id: Date.now().toString(),
      title: body.title,
      completed: body.completed || false,
    }, 201);
  },
  metadata: {
    tags: ["Tasks"],
    summary: "Create a new task",
  },
});

// Task Read
const TaskRead = createEndpoint({
  method: "get" as const,
  path: "/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: TaskSchema,
    404: z.object({
      error: z.string(),
    }),
  },
  handler: async (c) => {
    const params = c.req.valid("param");
    if (params.id === "1") {
      return c.json({
        id: params.id,
        title: "Sample Task",
        completed: false,
      }, 200);
    }
    return c.json({ error: "Task not found" }, 404);
  },
  metadata: {
    tags: ["Tasks"],
    summary: "Get a task by ID",
  },
});

// Task Update
const TaskUpdate = createEndpoint({
  method: "put" as const,
  path: "/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      title: z.string().optional(),
      completed: z.boolean().optional(),
    }),
  },
  responses: {
    200: TaskSchema,
  },
  handler: async (c) => {
    const params = c.req.valid("param");
    const body = c.req.valid("json");
    
    return c.json({
      id: params.id,
      title: body.title || "Updated Task",
      completed: body.completed !== undefined ? body.completed : false,
    }, 200);
  },
  metadata: {
    tags: ["Tasks"],
    summary: "Update a task",
  },
});

// Task Delete
const TaskDelete = createEndpoint({
  method: "delete" as const,
  path: "/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  handler: async (c) => {
    const params = c.req.valid("param");
    return c.json({
      success: true,
      message: `Task ${params.id} deleted successfully`,
    }, 200);
  },
  metadata: {
    tags: ["Tasks"],
    summary: "Delete a task",
  },
});

// Crear router Hono y agregar endpoints
export const tasksRouter = new Hono();
tasksRouter.route("/", TaskList);
tasksRouter.route("/", TaskCreate);
tasksRouter.route("/:id", TaskRead);
tasksRouter.route("/:id", TaskUpdate);
tasksRouter.route("/:id", TaskDelete);

// Exportar endpoints individuales también si es necesario
export { TaskList, TaskCreate, TaskRead, TaskUpdate, TaskDelete };