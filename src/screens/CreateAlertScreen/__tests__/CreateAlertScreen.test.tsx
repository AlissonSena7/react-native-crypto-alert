import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { CreateAlertScreen } from "@screens/CreateAlertScreen/CreateAlertScreen";
import { renderWithAlertProvider } from "@/test-utils/renderWithProviders";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
}));

const mockRouter = router as jest.Mocked<typeof router>;

const STORAGE_KEY = "cryptoAlerts";

jest.setTimeout(15000);

function renderScreen() {
  return renderWithAlertProvider(<CreateAlertScreen />);
}

async function selectCryptocurrency(name: string) {
  await fireEvent.press(screen.getByRole("button", { name: "Cryptocurrency" }));
  await fireEvent.press(await screen.findByText(name));
}

async function storedAlerts(): Promise<Array<Record<string, unknown>>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return JSON.parse(raw ?? "[]") as Array<Record<string, unknown>>;
}

describe("CreateAlertScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("exibe o título da tela e os rótulos do formulário", async () => {
    await renderScreen();

    expect(screen.getByText("Create Alert")).toBeOnTheScreen();
    expect(screen.getByText("Cryptocurrency")).toBeOnTheScreen();
    expect(screen.getByText("Target Price (USD)")).toBeOnTheScreen();
    expect(screen.getByText("Alert Condition")).toBeOnTheScreen();
  });

  it("exibe os placeholders de moeda e de preço antes do preenchimento", async () => {
    await renderScreen();

    expect(screen.getByText("Select cryptocurrency")).toBeOnTheScreen();
    expect(screen.getByPlaceholderText("0.00")).toBeOnTheScreen();
  });

  it("exibe as duas condições possíveis com seus textos", async () => {
    await renderScreen();

    expect(screen.getByText("Above target price")).toBeOnTheScreen();
    expect(screen.getByText("Alert when price goes above")).toBeOnTheScreen();
    expect(screen.getByText("Below target price")).toBeOnTheScreen();
    expect(screen.getByText("Alert when price goes below")).toBeOnTheScreen();
  });

  it("mantém a condição 'Above target price' selecionada por padrão", async () => {
    await renderScreen();

    expect(
      screen.getByRole("radio", { name: "Above target price" }),
    ).toBeSelected();
    expect(
      screen.getByRole("radio", { name: "Below target price" }),
    ).not.toBeSelected();
  });

  it("mantém o botão de salvar desabilitado enquanto o formulário está incompleto", async () => {
    await renderScreen();

    expect(screen.getByRole("button", { name: "Save Alert" })).toBeDisabled();
  });

  it("mantém o botão de salvar desabilitado quando o preço informado não é numérico", async () => {
    await renderScreen();

    await selectCryptocurrency("Bitcoin");
    await fireEvent.changeText(screen.getByPlaceholderText("0.00"), "abc");

    expect(screen.getByRole("button", { name: "Save Alert" })).toBeDisabled();
  });

  it("mantém o botão de salvar desabilitado quando o preço é zero", async () => {
    await renderScreen();

    await selectCryptocurrency("Bitcoin");
    await fireEvent.changeText(screen.getByPlaceholderText("0.00"), "0");

    expect(screen.getByRole("button", { name: "Save Alert" })).toBeDisabled();
  });

  it("habilita o botão de salvar quando a moeda e o preço são válidos", async () => {
    await renderScreen();

    await selectCryptocurrency("Bitcoin");
    await fireEvent.changeText(screen.getByPlaceholderText("0.00"), "70000");

    expect(screen.getByRole("button", { name: "Save Alert" })).toBeEnabled();
  });

  it("exibe a moeda selecionada com o símbolo no campo", async () => {
    await renderScreen();

    await selectCryptocurrency("Ethereum");

    expect(screen.getByText("Ethereum (ETH)")).toBeOnTheScreen();
  });

  it("exibe o valor digitado no campo de preço alvo", async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByPlaceholderText("0.00"), "70000");

    expect(screen.getByDisplayValue("70000")).toBeOnTheScreen();
  });

  it("troca a condição do alerta ao pressionar a opção abaixo do alvo", async () => {
    await renderScreen();

    await fireEvent.press(
      screen.getByRole("radio", { name: "Below target price" }),
    );

    expect(
      screen.getByRole("radio", { name: "Below target price" }),
    ).toBeSelected();
    expect(
      screen.getByRole("radio", { name: "Above target price" }),
    ).not.toBeSelected();
  });

  it("salva o alerta preenchido e navega para a lista de alertas", async () => {
    await renderScreen();

    await selectCryptocurrency("Bitcoin");
    await fireEvent.changeText(screen.getByPlaceholderText("0.00"), "70000");
    await fireEvent.press(
      screen.getByRole("radio", { name: "Below target price" }),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Save Alert" }));

    expect(mockRouter.replace).toHaveBeenCalledWith("/alerts");

    await waitFor(async () => {
      expect(await storedAlerts()).toEqual([
        expect.objectContaining({
          cryptocurrency: "Bitcoin",
          symbol: "BTC",
          targetPrice: 70000,
          condition: "below",
        }),
      ]);
    });
  });

  it("não salva nem navega quando o formulário está incompleto", async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole("button", { name: "Save Alert" }));

    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(await storedAlerts()).toEqual([]);
  });

  it("volta para a tela anterior ao pressionar o botão de voltar", async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole("button", { name: "Go back" }));

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});
