import { screen } from "@testing-library/react";
import { renderApp } from "./testing/screens.js";
import { describe, expect, it, vi } from "vitest";

describe("App", () => {
  it("shows the screen of the route it is asked for", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/health")) {
          return new Response(JSON.stringify({ status: "ok", database: "up" }), {
            status: 200,
          });
        }
        if (url.endsWith("/todos")) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        return new Response(null, { status: 404 });
      }),
    );

    renderApp("/");

    // TodoListScreen renders
    expect(await screen.findByRole("heading", { name: /todo app/i })).toBeInTheDocument();
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /health/i })).toBeInTheDocument();
  });
});