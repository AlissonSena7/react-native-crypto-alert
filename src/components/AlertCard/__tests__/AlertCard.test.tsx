import { fireEvent, render, screen } from "@testing-library/react-native";
import { AlertCard } from "@components/AlertCard/AlertCard";
import type { PriceAlert } from "@context/AlertProvider/useAlertProvider";

const aboveAlert: PriceAlert = {
  id: "alert-1",
  cryptocurrency: "Bitcoin",
  symbol: "BTC",
  targetPrice: 70000,
  condition: "above",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("AlertCard", () => {
  it("exibe o nome da moeda do alerta", async () => {
    await render(<AlertCard alert={aboveAlert} onDelete={jest.fn()} />);

    expect(screen.getByText("Bitcoin")).toBeOnTheScreen();
  });

  it("exibe a condição do alerta junto com o texto de descrição", async () => {
    await render(<AlertCard alert={aboveAlert} onDelete={jest.fn()} />);

    expect(screen.getByText("Alert when price goes above")).toBeOnTheScreen();
    expect(screen.getByText("above")).toBeOnTheScreen();
  });

  it("exibe a condição 'below' quando o alerta é de queda de preço", async () => {
    await render(
      <AlertCard
        alert={{ ...aboveAlert, condition: "below" }}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Alert when price goes below")).toBeOnTheScreen();
    expect(screen.getByText("below")).toBeOnTheScreen();
  });

  it("exibe o preço-alvo formatado", async () => {
    await render(<AlertCard alert={aboveAlert} onDelete={jest.fn()} />);

    expect(screen.getByText("$70,000.00")).toBeOnTheScreen();
  });

  it("exibe o botão de excluir o alerta", async () => {
    await render(<AlertCard alert={aboveAlert} onDelete={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Delete alert" })).toBeOnTheScreen();
  });

  it("chama onDelete com o id do alerta ao pressionar o botão de excluir", async () => {
    const onDelete = jest.fn();
    await render(<AlertCard alert={aboveAlert} onDelete={onDelete} />);

    await fireEvent.press(screen.getByRole("button", { name: "Delete alert" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("alert-1");
  });

  it("formata o preço-alvo com o separador de milhar", async () => {
    await render(
      <AlertCard
        alert={{ ...aboveAlert, targetPrice: 1234567.891 }}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("$1,234,567.89")).toBeOnTheScreen();
  });
});
