import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodoListScreen } from "./TodoListScreen.js";

afterEach(() => vi.unstubAllGlobals());

function renderWithRouter(ui: React.ReactElement) {
  render(
    <MemoryRouter initialEntries={["/"]}>
      {ui}
    </MemoryRouter>,
  );
}

describe("TodoListScreen", () => {
  it("renders the heading and message", () => {
    renderWithRouter(<TodoListScreen />);

    expect(screen.getByRole("heading", { name: /todo list/i })).toBeInTheDocument();
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /check api health/i })).toBeInTheDocument();
  });
});