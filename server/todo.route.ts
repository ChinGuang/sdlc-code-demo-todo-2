import { route } from "./app.js";
import { prisma } from "./prisma.js";
import type { Request, Response } from "express";

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
}