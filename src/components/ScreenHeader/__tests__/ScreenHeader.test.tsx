import { fireEvent, render, screen } from "@testing-library/react-native";
import { ScreenHeader } from "@components/ScreenHeader/ScreenHeader";

describe("ScreenHeader", () => {
  it("exibe o título da tela", async () => {
    await render(<ScreenHeader title="Create Alert" />);

    expect(screen.getByText("Create Alert")).toBeOnTheScreen();
  });

  it("não exibe o botão de voltar quando não há callback", async () => {
    await render(<ScreenHeader title="Create Alert" />);

    expect(screen.queryByRole("button", { name: "Go back" })).toBeNull();
  });

  it("exibe o botão de voltar quando há callback", async () => {
    await render(<ScreenHeader title="Create Alert" onBack={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Go back" })).toBeOnTheScreen();
  });

  it("chama onBack ao pressionar o botão de voltar", async () => {
    const onBack = jest.fn();
    await render(<ScreenHeader title="Create Alert" onBack={onBack} />);

    await fireEvent.press(screen.getByRole("button", { name: "Go back" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
