import { OpenAPIRoute, fromHono } from "chanfana";
import { Hono } from "hono";
import { z } from "zod";

// ... (TaskList y esquemas)

const tasks = new Hono();
const router = fromHono(tasks);
router.get("/", TaskList);

// DEBE SER ESTA LÍNEA EXACTA
export const tasksRouter = tasks; 
