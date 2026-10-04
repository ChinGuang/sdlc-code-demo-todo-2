import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HealthScreen } from "./HealthScreen.js";

afterEach(() => vi.unstubAllGlobals());

function stubHealth(body: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify(body), { status: ok ? 200 : 503 }),
    ),
  );
}

describe("HealthScreen", () => {
  it("shows loading state initially", async () => {
    // Delay the response to see loading state
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    render(<HealthScreen />);

    expect(screen.getByText("Health Check")).toBeInTheDocument();
    expect(screen.getByText("Status: checking...")).toBeInTheDocument();
  });

  it("shows the API status once it loads", async () => {
    stubHealth({ status: "ok", database: "up" });

    render(<HealthScreen />);

    expect(await screen.findByText("Health Check")).toBeInTheDocument();
    expect(await screen.findByText("Status: ok")).toBeInTheDocument();
  });

  it("shows degraded status when database down", async () => {
    stubHealth({ status: "degraded", database: "down" });

    render(<HealthScreen />);

    expect(await screen.findByText("Health Check")).toBeInTheDocument();
    expect(await screen.findByText("Status: degraded")).toBeInTheDocument();
  });

  it("shows an error when the API cannot be reached", async () => {
    stubHealth({}, false);

    render(<HealthScreen />);

    expect(await screen.findByText("Health Check")).toBeInTheDocument();
    expect(await screen.findByText("Status: error")).toBeInTheDocument();
  });
});
