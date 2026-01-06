import { createEndpoint } from "chanfana";
import { z } from "zod";

export const DummyEndpoint = createEndpoint({
  method: "post" as const,
  path: "/dummy/:slug",
  request: {
    params: z.object({
      slug: z.string(),
    }),
    body: z.object({
      name: z.string(),
    }),
  },
  responses: {
    200: z.object({
      success: z.boolean(),
      result: z.object({
        msg: z.string(),
        slug: z.string(),
        name: z.string(),
      }),
    }),
  },
  handler: async (c) => {
    const params = c.req.valid("param");
    const body = c.req.valid("json");

    return c.json({
      success: true,
      result: {
        msg: "this is a dummy endpoint, serving as example",
        slug: params.slug,
        name: body.name,
      },
    }, 200);
  },
  metadata: {
    tags: ["Dummy"],
    summary: "this endpoint is an example",
    operationId: "example-endpoint",
  },
});