import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
});
