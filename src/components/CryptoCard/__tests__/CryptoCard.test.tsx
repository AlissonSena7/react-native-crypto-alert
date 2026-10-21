import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, screen } from "@testing-library/react-native";
import { CryptoCard } from "@components/CryptoCard/CryptoCard";
import type { Cryptocurrency } from "@data/cryptoData";
import { renderWithAlertProvider } from "@/test-utils/renderWithProviders";

const STORAGE_KEY = "cryptoAlerts";

const bitcoin: Cryptocurrency = {
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "BTC",
  price: 67999.5,
  change24h: 2.45,
  image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
};

const ethereum: Cryptocurrency = {
  id: "ethereum",
  name: "Ethereum",
  symbol: "ETH",
  price: 3850.25,
  change24h: -1.23,
};

type SeededAlert = {
  id: string;
  cryptocurrency: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  createdAt: string;
};

function buildAlert(overrides: Partial<SeededAlert> = {}): SeededAlert {
  return {
    id: "alert-1",
    cryptocurrency: "Bitcoin",
    symbol: "BTC",
    targetPrice: 70000,
    condition: "above",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

async function seedAlerts(alerts: SeededAlert[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

describe("CryptoCard", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("exibe o nome e o símbolo da moeda", async () => {
    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);

    expect(screen.getByText("Bitcoin")).toBeOnTheScreen();
    expect(screen.getByText("BTC")).toBeOnTheScreen();
  });

  it("exibe o preço formatado com o símbolo da moeda", async () => {
    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);

    expect(screen.getByText("$67,999.50")).toBeOnTheScreen();
  });

  it("exibe a variação de 24h com o prefixo de positivo", async () => {
    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);

    expect(screen.getByText("+2.45%")).toBeOnTheScreen();
  });

  it("exibe a variação de 24h com o sinal negativo", async () => {
    await renderWithAlertProvider(<CryptoCard crypto={ethereum} />);

    expect(screen.getByText("-1.23%")).toBeOnTheScreen();
  });

  it("mostra a inicial do símbolo quando a moeda não possui imagem", async () => {
    await renderWithAlertProvider(<CryptoCard crypto={ethereum} />);

    expect(screen.getByText("E")).toBeOnTheScreen();
  });

  it("não exibe o badge de alertas quando a moeda não possui alertas", async () => {
    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);

    expect(
      screen.queryByLabelText("Toggle alerts for this cryptocurrency"),
    ).toBeNull();
  });

  it("exibe a contagem de um alerta quando existe um alerta para a moeda", async () => {
    await seedAlerts([buildAlert()]);

    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);

    expect(await screen.findByText("1 alert")).toBeOnTheScreen();
  });

  it("exibe a contagem no plural quando existem vários alertas para a moeda", async () => {
    await seedAlerts([
      buildAlert(),
      buildAlert({ id: "alert-2", targetPrice: 80000, condition: "below" }),
    ]);

    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);

    expect(await screen.findByText("2 alerts")).toBeOnTheScreen();
  });

  it("não exibe os detalhes dos alertas enquanto o badge está recolhido", async () => {
    await seedAlerts([buildAlert()]);

    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);
    await screen.findByText("1 alert");

    expect(screen.queryByText("Above target")).toBeNull();
  });

  it("expande os detalhes do alerta ao pressionar o badge", async () => {
    await seedAlerts([buildAlert()]);

    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);
    const badge = await screen.findByLabelText(
      "Toggle alerts for this cryptocurrency",
    );

    await fireEvent.press(badge);

    expect(await screen.findByText("Above target")).toBeOnTheScreen();
    expect(screen.getByText("$70,000.00")).toBeOnTheScreen();
  });

  it("recolhe os detalhes do alerta ao pressionar o badge novamente", async () => {
    await seedAlerts([buildAlert()]);

    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);
    const badge = await screen.findByLabelText(
      "Toggle alerts for this cryptocurrency",
    );

    await fireEvent.press(badge);
    await screen.findByText("Above target");
    await fireEvent.press(badge);

    expect(screen.queryByText("Above target")).toBeNull();
  });

  it("exibe a condição 'below' no detalhe do alerta expandido", async () => {
    await seedAlerts([buildAlert({ condition: "below" })]);

    await renderWithAlertProvider(<CryptoCard crypto={bitcoin} />);
    const badge = await screen.findByLabelText(
      "Toggle alerts for this cryptocurrency",
    );
    await fireEvent.press(badge);

    expect(await screen.findByText("Below target")).toBeOnTheScreen();
  });

  it("não exibe alertas de outra moeda no card", async () => {
    await seedAlerts([buildAlert()]);

    await renderWithAlertProvider(<CryptoCard crypto={ethereum} />);

    expect(
      screen.queryByLabelText("Toggle alerts for this cryptocurrency"),
    ).toBeNull();
  });
});
