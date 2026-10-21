import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { PrimaryButton } from "@components/PrimaryButton/PrimaryButton";

describe("PrimaryButton", () => {
  it("exibe o rótulo do botão", async () => {
    await render(<PrimaryButton label="Save Alert" onPress={jest.fn()} />);

    expect(screen.getByText("Save Alert")).toBeOnTheScreen();
  });

  it("chama onPress ao pressionar o botão", async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Save Alert" onPress={onPress} />);

    await fireEvent.press(screen.getByRole("button", { name: "Save Alert" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("não chama onPress quando o botão está desabilitado", async () => {
    const onPress = jest.fn();
    await render(
      <PrimaryButton label="Save Alert" onPress={onPress} disabled />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Save Alert" }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("expõe o estado desabilitado para acessibilidade", async () => {
    await render(
      <PrimaryButton label="Save Alert" onPress={jest.fn()} disabled />,
    );

    expect(screen.getByRole("button", { name: "Save Alert" })).toBeDisabled();
  });

  it("expõe o estado habilitado para acessibilidade", async () => {
    await render(<PrimaryButton label="Save Alert" onPress={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Save Alert" })).toBeEnabled();
  });

  it("renderiza o ícone esquerdo quando informado", async () => {
    await render(
      <PrimaryButton
        label="New Alert"
        onPress={jest.fn()}
        leftIcon={<Text>★</Text>}
      />,
    );

    expect(screen.getByText("★")).toBeOnTheScreen();
    expect(screen.getByText("New Alert")).toBeOnTheScreen();
  });

  it("permite pressionar o botão várias vezes", async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Save Alert" onPress={onPress} />);

    const button = screen.getByRole("button", { name: "Save Alert" });
    await fireEvent.press(button);
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
