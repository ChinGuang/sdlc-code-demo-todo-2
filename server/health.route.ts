import { route } from "./app.js";
import { prisma } from "./prisma.js";
import type { Request, Response } from "express";

export function registerHealthRoutes(app: ReturnType<typeof import("./app.js").createApp>) {
  app.get(
    "/health",
    route(async (_request: Request, response: Response) => {
      const database = await prisma
        .$queryRaw`SELECT 1`.then(() => "up" as const)
        .catch(() => "down" as const);
      response.status(database === "up" ? 200 : 503).json({
        status: database === "up" ? "ok" : "degraded",
        database,
      });
    }),
  );
}