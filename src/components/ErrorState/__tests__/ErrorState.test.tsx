import { fireEvent, render, screen } from "@testing-library/react-native";
import { ErrorState } from "@components/ErrorState/ErrorState";

describe("ErrorState", () => {
  it("exibe o título e a mensagem padrão quando não são informados", async () => {
    await render(<ErrorState />);

    expect(screen.getByText("Something went wrong")).toBeOnTheScreen();
    expect(
      screen.getByText("We couldn't load the data. Please try again."),
    ).toBeOnTheScreen();
  });

  it("exibe o título e a mensagem informados", async () => {
    await render(
      <ErrorState
        title="Failed to load"
        message="Unable to fetch cryptocurrency data. Please try again."
      />,
    );

    expect(screen.getByText("Failed to load")).toBeOnTheScreen();
    expect(
      screen.getByText("Unable to fetch cryptocurrency data. Please try again."),
    ).toBeOnTheScreen();
  });

  it("não exibe o botão de tentar novamente quando não há callback", async () => {
    await render(<ErrorState />);

    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("exibe o botão de tentar novamente quando há callback", async () => {
    await render(<ErrorState onRetry={jest.fn()} />);

    expect(
      screen.getByRole("button", { name: "Retry" }),
    ).toBeOnTheScreen();
  });

  it("chama onRetry ao pressionar o botão de tentar novamente", async () => {
    const onRetry = jest.fn();
    await render(<ErrorState onRetry={onRetry} />);

    await fireEvent.press(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
