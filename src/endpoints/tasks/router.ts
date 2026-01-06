import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

// Esquema de validación
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

export class TaskList extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Listar todas las tareas",
    responses: {
      "200": {
        description: "Lista de tareas obtenida con éxito",
        content: {
          "application/json": {
            schema: z.object({
              tasks: z.array(TaskSchema),
            }),
          },
        },
      },
    },
  };

  async handle() {
    // Aquí puedes agregar lógica de D1 después
    return {
      tasks: [
        { id: "1", title: "Tarea de ejemplo", completed: false },
      ],
    };
  }
}
