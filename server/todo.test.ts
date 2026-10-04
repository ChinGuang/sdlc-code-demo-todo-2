import request from "supertest";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createApp } from "./app.js";
import { registerHealthRoutes } from "./health.route.js";
import { registerTodoRoutes } from "./todo.route.js";
import { prisma } from "./prisma.js";

describe("GET /todos", () => {
  const app = createApp((app) => {
    registerHealthRoutes(app);
    registerTodoRoutes(app);
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("returns an empty array when no todos exist", async () => {
    const response = await request(app).get("/todos");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns todos with title and completion status", async () => {
    await prisma.todo.createMany({
      data: [
        { title: "First todo", completed: false },
        { title: "Second todo", completed: true },
      ],
    });

    const response = await request(app).get("/todos");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    // Check shape
    const [first, second] = response.body;
    expect(first).toHaveProperty("id");
    expect(first.title).toBe("First todo");
    expect(first.completed).toBe(false);
    expect(first.createdAt).toBeDefined();
    expect(first.updatedAt).toBeDefined();
    expect(second.title).toBe("Second todo");
    expect(second.completed).toBe(true);
  });
});