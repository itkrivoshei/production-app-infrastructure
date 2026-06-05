import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  it("provides navigation through the mobile menu", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AppLayout>
          <div>Page content</div>
        </AppLayout>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Metrics" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Metrics" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
