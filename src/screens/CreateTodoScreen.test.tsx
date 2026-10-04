import { screen } from "@testing-library/react";
import { renderRoute, currentPath } from "../testing/screens";
import { describe, expect, it } from "vitest";
import { stubApi } from "../testing/stubApi";
import { CreateTodoScreen } from "./CreateTodoScreen";

describe("CreateTodoScreen", () => {
  it("shows loading state on submit", async () => {
    // Simulate a pending request (no immediate response)
    stubApi({ "POST /todos": "pending" });
    renderRoute(<CreateTodoScreen />, { route: "/create", at: "/create" });

    // Type a title
    typeInto("Todo title", "Buy milk");
    // Submit the form
    press("Save");

    // Button should be disabled and show saving text
    const button = await screen.findByRole("button", { name: /saving…/i });
    expect(button).toBeDisabled();
  });

  it("shows error when API fails", async () => {
    stubApi({ "POST /todos": { status: 400, body: { error: "Validation error" } } });
    renderRoute(<CreateTodoScreen />, { route: "/create", at: "/create" });

    typeInto("Todo title", "Buy milk");
    press("Save");

    // Wait for error alert
    expect(await screen.findByRole("alert")).toHaveTextContent(/validation error/i);
    // Button should be enabled again
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
    // Should remain on the same page
    expect(currentPath()).toBe("/create");
  });

  it("navigates to home on success", async () => {
    // Mock successful creation returning a todo object
    const createdTodo = {
      id: "1",
      title: "Buy milk",
      completed: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };
    stubApi({ "POST /todos": { status: 201, body: createdTodo } });
    renderRoute(<CreateTodoScreen />, { route: "/create", at: "/create" });

    typeInto("Todo title", "Buy milk");
    press("Save");

    // After submission, we should navigate to the home page
    await expect.poll(() => currentPath()).toBe("/");
    // Optionally, we could also check that the button is back to normal state
    // but since we navigate away, the component is unmounted.
  });
});

// Helper function to type into an input by its label text
function typeInto(label: string, text: string) {
  const input = screen.getByLabelText(label) as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

// Helper function to press a button by its accessible name
function press(name: string) {
  const button = screen.getByRole("button", { name });
  button.click();
}