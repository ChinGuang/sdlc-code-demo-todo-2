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

describe("PATCH /todos/:id", () => {
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

  it("toggles completed status from false to true", async () => {
    const todo = await prisma.todo.create({
      data: { title: "Test todo", completed: false },
    });

    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ completed: true })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.id).toBe(todo.id);
    expect(response.body.title).toBe(todo.title);
    expect(response.body.completed).toBe(true);
    expect(response.body.updatedAt).toBeDefined();
  });

  it("toggles completed status from true to false", async () => {
    const todo = await prisma.todo.create({
      data: { title: "Test todo", completed: true },
    });

    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ completed: false })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.id).toBe(todo.id);
    expect(response.body.title).toBe(todo.title);
    expect(response.body.completed).toBe(false);
    expect(response.body.updatedAt).toBeDefined();
  });

  it("updates the title", async () => {
    const todo = await prisma.todo.create({
      data: { title: "Original title", completed: false },
    });

    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ title: "Updated title" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.id).toBe(todo.id);
    expect(response.body.title).toBe("Updated title");
    expect(response.body.completed).toBe(false);
    expect(response.body.updatedAt).toBeDefined();
  });

  it("updates both title and completed status", async () => {
    const todo = await prisma.todo.create({
      data: { title: "Original title", completed: false },
    });

    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ title: "New title", completed: true })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.id).toBe(todo.id);
    expect(response.body.title).toBe("New title");
    expect(response.body.completed).toBe(true);
    expect(response.body.updatedAt).toBeDefined();
  });

  it("returns 400 when request body is empty", async () => {
    const todo = await prisma.todo.create({
      data: { title: "Test todo", completed: false },
    });

    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({})
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({ error: "Validation error" });
  });

  it("returns 400 when title is empty string", async () => {
    const todo = await prisma.todo.create({
      data: { title: "Test todo", completed: false },
    });

    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ title: "" })
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({ error: "Validation error" });
  });

  it("returns 400 when title exceeds 200 characters", async () => {
    const todo = await prisma.todo.create({
      data: { title: "Test todo", completed: false },
    });

    const longTitle = "a".repeat(201);
    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ title: longTitle })
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({ error: "Validation error" });
  });

  it("returns 404 when todo does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .patch(`/todos/${fakeId}`)
      .send({ completed: true })
      .expect("Content-Type", /json/)
      .expect(404);

    expect(response.body).toEqual({ error: "Todo not found" });
  });
});

describe("DELETE /todos/:id", () => {
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

  it("deletes an existing todo and returns 204", async () => {
    const todo = await prisma.todo.create({
      data: { title: "Todo to delete", completed: false },
    });

    let response = await request(app).get(`/todos`);
    expect(response.body).toHaveLength(1);

    response = await request(app).delete(`/todos/${todo.id}`).expect(204);

    response = await request(app).get(`/todos`);
    expect(response.body).toHaveLength(0);
  });

  it("returns 404 when todo does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .delete(`/todos/${fakeId}`)
      .expect("Content-Type", /json/)
      .expect(404);

    expect(response.body).toEqual({ error: "Todo not found" });
  });
});