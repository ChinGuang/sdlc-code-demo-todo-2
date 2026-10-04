import { screen } from "@testing-library/react";
import { renderRoute } from "../testing/screens.tsx";
import { describe, expect, it, vi } from "vitest";
import { stubApi } from "../testing/stubApi.ts";
import { TodoListScreen } from "./TodoListScreen.tsx";

describe("TodoListScreen", () => {
  it("shows loading state", async () => {
    stubApi({ "GET /todos": "pending" });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    expect(await screen.findByRole("heading", { name: /todo app/i })).toBeInTheDocument();
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("shows empty state when no todos", async () => {
    stubApi({ "GET /todos": { body: [] } });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    expect(await screen.findByRole("heading", { name: /todo app/i })).toBeInTheDocument();
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("shows error state when API fails", async () => {
    stubApi({ "GET /todos": { status: 500, body: { error: "Internal Server Error" } } });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    expect(await screen.findByRole("heading", { name: /todo app/i })).toBeInTheDocument();
    expect(await screen.findByText(/error:/i)).toBeInTheDocument();
  });

  it("renders list of todos", async () => {
    const todos = [
      { id: "1", title: "Learn React", completed: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
      { id: "2", title: "Write tests", completed: true, createdAt: "2024-01-02T00:00:00Z", updatedAt: "2024-01-02T00:00:00Z" },
    ];
    stubApi({ "GET /todos": { body: todos } });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    expect(await screen.findByRole("heading", { name: /todo app/i })).toBeInTheDocument();
    // Check each todo title and status
    expect(await screen.findByText(/learn react/i)).toBeInTheDocument();
    expect(await screen.findByText(/write tests/i)).toBeInTheDocument();
    expect(await screen.findAllByText(/Pending/)).toHaveLength(1);
    expect(await screen.findAllByText(/Done/)).toHaveLength(1);
  });
});