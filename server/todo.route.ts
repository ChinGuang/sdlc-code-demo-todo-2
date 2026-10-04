import { route } from "./app.js";
import { prisma } from "./prisma.js";
import type { Request, Response } from "express";
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
});

export function registerTodoRoutes(app: ReturnType<typeof import("./app.js").createApp>) {
  app.get(
    "/todos",
    route(async (_request: Request, response: Response) => {
      const todos = await prisma.todo.findMany({
        orderBy: { createdAt: "asc" },
      });
      response.json(todos);
    }),
  );

  app.post(
    "/todos",
    route(async (request: Request, response: Response) => {
      const result = createTodoSchema.safeParse(request.body);
      if (!result.success) {
        response.status(400).json({ error: "Validation error" });
        return;
      }

      const { title } = result.data;
      const todo = await prisma.todo.create({
        data: { title },
      });

      response.status(201).json(todo);
    }),
  );
}