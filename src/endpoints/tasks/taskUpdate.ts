import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class TaskUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Actualizar una tarea",
    request: {
      params: z.object({
        slug: z.string().describe("El slug único de la tarea"),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().optional(),
              description: z.string().optional(),
              completed: z.boolean().optional(),
              due_date: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Tarea actualizada correctamente",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              result: z.any(),
            }),
          },
        },
      },
      "400": {
        description: "Cuerpo de la solicitud inválido o error de base de datos",
        content: {
          "application/json": {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
      "404": {
        description: "Tarea no encontrada",
        content: {
          "application/json": {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
      "500": {
        description: "Error interno del servidor",
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
    const taskUpdate: { name?: string; description?: string; completed?: boolean; due_date?: string } = data.body;

    const updateFields: { [key: string]: any } = {};
    if (taskUpdate.name !== undefined) updateFields.name = taskUpdate.name;
    if (taskUpdate.description !== undefined) updateFields.description = taskUpdate.description;
    if (taskUpdate.completed !== undefined) updateFields.completed = taskUpdate.completed ? 1 : 0;
    if (taskUpdate.due_date !== undefined) updateFields.due_date = taskUpdate.due_date;

    const fieldsToUpdate = Object.keys(updateFields);
    if (fieldsToUpdate.length === 0) {
      return c.json({ success: false, error: "Request body is empty or contains no fields to update." }, 400);
    }

    const setClauses = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
    const bindings = [...fieldsToUpdate.map((field) => updateFields[field]), slug];

    try {
      const { results } = await c.env.DB.prepare(`UPDATE tasks SET ${setClauses} WHERE slug = ? RETURNING *`)
        .bind(...bindings)
        .run();

      if (!results || results.length === 0) {
        return c.json({ success: false, error: "Task not found" }, 404);
      }

      return c.json({ success: true, result: results[0] });
    } catch (e: any) {
      return c.json({ success: false, error: e.message }, 500);
    }
  }
}