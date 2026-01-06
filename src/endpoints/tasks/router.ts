import { CreateEndpoint, fromHono } from "chanfana";
import { Hono } from "hono";
import { z } from "zod";

// --- Esquemas ---
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

// --- Endpoints ---

const TaskList = CreateEndpoint({
  method: "get",
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
  metadata: { tags: ["Tasks"], summary: "List all tasks" },
});

const TaskCreate = CreateEndpoint({
  method: "post",
  path: "/",
  request: {
    body: z.object({
      title: z.string().min(1),
      completed: z.boolean().optional().default(false),
    }),
  },
  responses: { 201: TaskSchema },
  handler: async (c) => {
    const body = c.req.valid("json");
    return c.json({
      id: Date.now().toString(),
      title: body.title,
      completed: body.completed || false,
    }, 201);
  },
  metadata: { tags: ["Tasks"], summary: "Create a new task" },
});

const TaskRead = CreateEndpoint({
  method: "get",
  path: "/:id",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: TaskSchema,
    404: z.object({ error: z.string() }),
  },
  handler: async (c) => {
    const params = c.req.valid("param");
    if (params.id === "1") {
      return c.json({ id: params.id, title: "Sample Task", completed: false }, 200);
    }
    return c.json({ error: "Task not found" }, 404);
  },
  metadata: { tags: ["Tasks"], summary: "Get a task by ID" },
});

const TaskUpdate = CreateEndpoint({
  method: "put",
  path: "/:id",
  request: {
    params: z.object({ id: z.string() }),
    body: z.object({
      title: z.string().optional(),
      completed: z.boolean().optional(),
    }),
  },
  responses: { 200: TaskSchema },
  handler: async (c) => {
    const params = c.req.valid("param");
    const body = c.req.valid("json");
    return c.json({
      id: params.id,
      title: body.title || "Updated Task",
      completed: body.completed !== undefined ? body.completed : false,
    }, 200);
  },
  metadata: { tags: ["Tasks"], summary: "Update a task" },
});

const TaskDelete = CreateEndpoint({
  method: "delete",
  path: "/:id",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: z.object({ success: z.boolean(), message: z.string() }),
  },
  handler: async (c) => {
    const params = c.req.valid("param");
    return c.json({ success: true, message: `Task ${params.id} deleted` }, 200);
  },
  metadata: { tags: ["Tasks"], summary: "Delete a task" },
});

// --- Configuración del Router ---

// 1. Instanciamos Hono normal
const baseHono = new Hono();

// 2. Lo envolvemos con chanfana para que entienda las clases CreateEndpoint
export const tasksRouter = fromHono(baseHono);

// 3. Registramos los endpoints usando los métodos del router
// IMPORTANTE: Se pasan las clases sin paréntesis (), Chanfana hará el 'new'
tasksRouter.get("/", TaskList);
tasksRouter.post("/", TaskCreate);
tasksRouter.get("/:id", TaskRead);
tasksRouter.put("/:id", TaskUpdate);
tasksRouter.delete("/:id", TaskDelete);

// Exportar endpoints individuales por si se necesitan en tests
export { TaskList, TaskCreate, TaskRead, TaskUpdate, TaskDelete };
