import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Docs } from "./Docs";

describe("Docs", () => {
  it("opens local API documentation through the edge", () => {
    render(<Docs />);

    expect(
      screen.getByRole("link", { name: "Open API Docs" }),
    ).toHaveAttribute("href", "/api/docs");
  });
});
