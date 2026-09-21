import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("identifies the Dealer Smart foundation", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Dealer Smart" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Fundação técnica/i)).toBeInTheDocument();
});
