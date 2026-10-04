import { screen } from "@testing-library/react";
import { renderRoute } from "../testing/screens";
import { describe, expect, it } from "vitest";
import { stubApi } from "../testing/stubApi";
import { ToggleTodoScreen } from "./ToggleTodoScreen";
import { press } from "../testing/screens";

describe("ToggleTodoScreen", () => {
  it("renders with correct heading and no add form", async () => {
    stubApi({ "GET /todos": { body: [] } });
    renderRoute(<ToggleTodoScreen />, { route: "/toggle", at: "/toggle" });
    // Check heading
    expect(await screen.findByRole("heading", { name: /toggle todo/i })).toBeInTheDocument();
    // Ensure no add form (input with placeholder "New todo title")
    expect(screen.queryByPlaceholderText(/new todo title/i)).not.toBeInTheDocument();
    // But there should be a list area (even if empty)
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("toggles a todo", async () => {
    const todos = [
      { id: "1", title: "Learn React", completed: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ];
    stubApi({
      "GET /todos": { body: todos },
      "PATCH /todos/1": { body: { ...todos[0], completed: true } },
    });
    renderRoute(<ToggleTodoScreen />, { route: "/toggle", at: "/toggle" });
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

  it("shows loading state while fetching todos", async () => {
    stubApi({ "GET /todos": "pending" });
    renderRoute(<ToggleTodoScreen />, { route: "/toggle", at: "/toggle" });
    // Should see loading text
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("shows empty list after fetching todos", async () => {
    stubApi({ "GET /todos": { body: [] } });
    renderRoute(<ToggleTodoScreen />, { route: "/toggle", at: "/toggle" });
    // Should see empty list message
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    stubApi({
      "GET /todos": { status: 500 },
    });
    renderRoute(<ToggleTodoScreen />, { route: "/toggle", at: "/toggle" });
    // Should see error message
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});