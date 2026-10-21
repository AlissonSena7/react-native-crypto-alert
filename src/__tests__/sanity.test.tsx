import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";

describe("sanidade do ambiente de testes", () => {
  it("renderiza um componente React Native", async () => {
    await render(
      <View>
        <Text>Ambiente de testes configurado</Text>
      </View>,
    );

    expect(screen.getByText("Ambiente de testes configurado")).toBeOnTheScreen();
  });
});
