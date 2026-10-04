import { screen } from "@testing-library/react";
import { renderRoute } from "../testing/screens";
import { describe, expect, it } from "vitest";
import { stubApi } from "../testing/stubApi";
import { TodoListScreen } from "./TodoListScreen";
import { press } from "../testing/screens";

describe("TodoListScreen", () => {
  it("renders with correct heading and add form", async () => {
    stubApi({ "GET /todos": { body: [] } });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    // Check heading
    expect(await screen.findByRole("heading", { name: /todo app/i })).toBeInTheDocument();
    // Check add form
    expect(screen.getByPlaceholderText(/new todo title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    // Empty list message
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("lists todos with title and status", async () => {
    const todos = [
      { id: "1", title: "Learn React", completed: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
      { id: "2", title: "Write tests", completed: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ];
    stubApi({ "GET /todos": { body: todos } });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    // Wait for todos to appear
    expect(await screen.findByText(/learn react/i)).toBeInTheDocument();
    expect(await screen.findByText(/write tests/i)).toBeInTheDocument();
    // Check status texts using data-testid
    const statusElements = await screen.findAllByTestId('todo-status');
    expect(statusElements).toHaveLength(2);
    expect(statusElements[0]).toHaveTextContent('Pending');
    expect(statusElements[1]).toHaveTextContent('Done');
  });

  it("toggles a todo", async () => {
    const todos = [
      { id: "1", title: "Learn React", completed: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ];
    stubApi({
      "GET /todos": { body: todos },
      "PATCH /todos/1": { body: { ...todos[0], completed: true } },
    });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    // Wait for the todo to appear
    await screen.findByText(/learn react/i);
    // Find the toggle button (text: Toggle) and click it
    await press(/toggle/i);
    // While toggling, button should show toggling...
    expect(await screen.findByText(/toggling/i)).toBeInTheDocument();
    // Wait for the status to become Done
    const statusElement = await screen.findByTestId('todo-status');
    expect(statusElement).toHaveTextContent('Done');
  });

  it("handles error loading todos", async () => {
    stubApi({ "GET /todos": { status: 500 } });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    expect(await screen.findByText(/error:/i)).toBeInTheDocument();
  });

  it("handles error toggling todo", async () => {
    const todos = [
      { id: "1", title: "Learn React", completed: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ];
    stubApi({
      "GET /todos": { body: todos },
      "PATCH /todos/1": { status: 500 },
    });
    renderRoute(<TodoListScreen />, { route: "/", at: "/" });
    await screen.findByText(/learn react/i);
    await press(/toggle/i);
    expect(await screen.findByText(/error:/i)).toBeInTheDocument();
  });
});