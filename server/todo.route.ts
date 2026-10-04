import { route } from "./app.js";
import { prisma } from "./prisma.js";
import type { Request, Response } from "express";
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
}).refine((data) => data.title !== undefined || data.completed !== undefined, {
  message: "Must provide at least one field to update",
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

  app.patch(
    "/todos/:id",
    route(async (request: Request, response: Response) => {
      const { id } = request.params;
      const todoId = Array.isArray(id) ? id[0] : id;

      // Validate request body
      const result = updateTodoSchema.safeParse(request.body);
      if (!result.success) {
        response.status(400).json({ error: "Validation error" });
        return;
      }

      const data = result.data;

      try {
        // Find and update the todo
        const todo = await prisma.todo.update({
          where: { id: todoId },
          data,
        });

        response.json(todo);
      } catch (error) {
        // Prisma error: record not found
        if (error instanceof Error && (error.message.includes("Record to update not found") || error.message.includes("not found"))) {
          response.status(404).json({ error: "Todo not found" });
        } else {
          throw error;
        }
      }
    }),
  );

  app.delete(
    "/todos/:id",
    route(async (request: Request, response: Response) => {
      const { id } = request.params;
      const todoId = Array.isArray(id) ? id[0] : id;

      try {
        await prisma.todo.delete({
          where: { id: todoId },
        });
        response.status(204).send();
      } catch (error) {
        // Prisma error: record not found
        if (error instanceof Error && (error.message.includes("Record to delete not found") || error.message.includes("not found"))) {
          response.status(404).json({ error: "Todo not found" });
        } else {
          throw error;
        }
      }
    }),
  );
}