import { render, screen } from "@testing-library/react-native";
import { LoadingState } from "@components/LoadingState/LoadingState";

describe("LoadingState", () => {
  it("exibe a mensagem padrão quando nenhuma mensagem é informada", async () => {
    await render(<LoadingState />);

    expect(screen.getByText("Loading...")).toBeOnTheScreen();
  });

  it("exibe a mensagem informada", async () => {
    await render(<LoadingState message="Loading cryptocurrencies..." />);

    expect(screen.getByText("Loading cryptocurrencies...")).toBeOnTheScreen();
    expect(screen.queryByText("Loading...")).toBeNull();
  });
});
