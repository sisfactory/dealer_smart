import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";

describe("cn", () => {
  it("keeps only the final Tailwind class for a conflicting utility", () => {
    const classes = cn("rounded-[4px] px-2", false, "px-6");

    expect(classes).toContain("rounded-[4px]");
    expect(classes).toContain("px-6");
    expect(classes).not.toContain("px-2");
  });
});

describe("Button", () => {
  it("exposes button semantics and focusable content", async () => {
    const user = userEvent.setup();

    render(<Button>Salvar</Button>);

    await user.tab();

    expect(screen.getByRole("button", { name: "Salvar" })).toHaveFocus();
  });

  it("forwards native props and defaults its type to button", () => {
    render(
      <Button className="custom-class" disabled name="save">
        Salvar
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Salvar" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveClass(
      "custom-class",
    );
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveAttribute(
      "name",
      "save",
    );
  });
});

describe("Card", () => {
  it("renders a card heading with accessible structure", () => {
    render(<Card title="Visão geral">Conteúdo</Card>);

    expect(screen.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    expect(screen.getByText("Conteúdo")).toBeVisible();
  });

  it("associates each card with its own heading ID", () => {
    render(
      <>
        <Card title="Visão geral">Primeiro conteúdo</Card>
        <Card title="Indicadores">Segundo conteúdo</Card>
      </>,
    );

    const cards = screen.getAllByRole("article");
    const labelledBy = cards.map((card) =>
      card.getAttribute("aria-labelledby"),
    );

    expect(labelledBy[0]).toBeTruthy();
    expect(labelledBy[1]).toBeTruthy();
    expect(labelledBy[0]).not.toBe(labelledBy[1]);

    for (const [index, card] of cards.entries()) {
      const heading = within(card).getByRole("heading");

      expect(heading).toHaveAttribute("id", labelledBy[index]);
    }
  });
});
