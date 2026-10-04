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

describe("POST /todos", () => {
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

  it("creates a todo and returns 201 with the created todo", async () => {
    const response = await request(app)
      .post("/todos")
      .send({ title: "Learn TDD" })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body.title).toBe("Learn TDD");
    expect(response.body.completed).toBe(false);
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it("returns 400 when title is missing", async () => {
    const response = await request(app)
      .post("/todos")
      .send({})
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({ error: "Validation error" });
  });

  it("returns 400 when title is empty string", async () => {
    const response = await request(app)
      .post("/todos")
      .send({ title: "" })
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({ error: "Validation error" });
  });

  it("returns 400 when title exceeds 200 characters", async () => {
    const longTitle = "a".repeat(201);
    const response = await request(app)
      .post("/todos")
      .send({ title: longTitle })
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({ error: "Validation error" });
  });
});