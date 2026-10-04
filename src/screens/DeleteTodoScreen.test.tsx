import { screen } from "@testing-library/react";
import { renderRoute } from "../testing/screens";
import { describe, expect, it } from "vitest";
import { stubApi } from "../testing/stubApi";
import { DeleteTodoScreen } from "./DeleteTodoScreen";
import { press } from "../testing/screens";
import { waitFor } from "@testing-library/react";

describe("DeleteTodoScreen", () => {
  it("shows loading while fetching todos", async () => {
    stubApi({ "GET /todos": "pending" });
    renderRoute(<DeleteTodoScreen />, { route: "/delete", at: "/delete" });
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("shows empty list when no todos", async () => {
    stubApi({ "GET /todos": { body: [] } });
    renderRoute(<DeleteTodoScreen />, { route: "/delete", at: "/delete" });
    expect(await screen.findByRole("heading", { name: /delete todo/i })).toBeInTheDocument();
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("lists todos with delete buttons", async () => {
    const todos = [
      { id: "1", title: "Learn React", completed: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
      { id: "2", title: "Write tests", completed: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ];
    stubApi({ "GET /todos": { body: todos } });
    renderRoute(<DeleteTodoScreen />, { route: "/delete", at: "/delete" });
    // Wait for todos to appear
    expect(await screen.findByText(/learn react/i)).toBeInTheDocument();
    expect(await screen.findByText(/write tests/i)).toBeInTheDocument();
    // Check delete buttons
    const deleteButtons = await screen.findAllByRole("button", { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it("deletes a todo and removes it from the list", async () => {
    const todos = [
      { id: "1", title: "Learn React", completed: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ];
    const { calls } = stubApi({
      "GET /todos": { body: todos },
      "DELETE /todos/1": { status: 204 },
    });
    renderRoute(<DeleteTodoScreen />, { route: "/delete", at: "/delete" });
    // Wait for initial list
    await screen.findByText(/learn react/i);
    // Click delete button
    await press("Delete");
    // Wait for empty state (todo removed and empty message shown)
    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
    // Assert that a DELETE call was made
    expect(calls).toContainEqual({ method: "DELETE", path: "/todos/1", body: null });
  });

  it("handles error loading todos", async () => {
    stubApi({ "GET /todos": { status: 500 } });
    renderRoute(<DeleteTodoScreen />, { route: "/delete", at: "/delete" });
    expect(await screen.findByText(/error:/i)).toBeInTheDocument();
  });

  it("handles error deleting a todo", async () => {
    const todos = [
      { id: "1", title: "Learn React", completed: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ];
    stubApi({
      "GET /todos": { body: todos },
      "DELETE /todos/1": { status: 500 },
    });
    renderRoute(<DeleteTodoScreen />, { route: "/delete", at: "/delete" });
    await screen.findByText(/learn react/i);
    await press("Delete");
    expect(await screen.findByText(/error:/i)).toBeInTheDocument();
  });
});