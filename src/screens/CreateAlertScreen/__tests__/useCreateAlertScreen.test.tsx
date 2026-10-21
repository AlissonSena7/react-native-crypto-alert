import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AlertProvider } from "@context/AlertProvider/AlertProvider";
import { useAlerts } from "@context/AlertProvider/useAlertProvider";
import { useCreateAlertScreen } from "@screens/CreateAlertScreen/useCreateAlertScreen";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
}));

const mockRouter = router as jest.Mocked<typeof router>;

function wrapper({ children }: { children: React.ReactNode }) {
  return <AlertProvider>{children}</AlertProvider>;
}

async function renderCreateAlertHook() {
  return renderHook(
    () => ({ screen: useCreateAlertScreen(), context: useAlerts() }),
    { wrapper },
  );
}

type ScreenState = Awaited<
  ReturnType<typeof renderCreateAlertHook>
>["result"]["current"]["screen"];

async function fillForm(
  screen: ScreenState,
  {
    crypto,
    price,
    condition,
  }: { crypto?: string; price?: string; condition?: "above" | "below" },
) {
  if (crypto !== undefined) {
    await act(async () => {
      screen.setSelectedCrypto(crypto);
    });
  }
  if (price !== undefined) {
    await act(async () => {
      screen.setTargetPrice(price);
    });
  }
  if (condition !== undefined) {
    await act(async () => {
      screen.setCondition(condition);
    });
  }
}

describe("useCreateAlertScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("inicia sem moeda selecionada, sem preço e com a condição 'above'", async () => {
    const { result } = await renderCreateAlertHook();

    expect(result.current.screen.selectedCrypto).toBe("");
    expect(result.current.screen.targetPrice).toBe("");
    expect(result.current.screen.condition).toBe("above");
    expect(result.current.screen.errors).toEqual({});
  });

  it("considera o formulário inválido enquanto o preço não for informado", async () => {
    const { result } = await renderCreateAlertHook();

    expect(result.current.screen.isFormValid).toBe(false);
  });

  it("considera o formulário válido quando a moeda e o preço são válidos", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, { crypto: "bitcoin", price: "70000" });

    expect(result.current.screen.isFormValid).toBe(true);
  });

  it("considera o formulário inválido quando o preço é zero", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, { crypto: "bitcoin", price: "0" });

    expect(result.current.screen.isFormValid).toBe(false);
  });

  it("exibe o erro de cryptocurrency ausente ao salvar sem seleção", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, { price: "70000" });
    await act(async () => {
      result.current.screen.handleSave();
    });

    expect(result.current.screen.errors.crypto).toBe(
      "Please select a cryptocurrency",
    );
  });

  it("exibe o erro de preço ausente ao salvar sem informar o preço", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, { crypto: "bitcoin" });
    await act(async () => {
      result.current.screen.handleSave();
    });

    expect(result.current.screen.errors.price).toBe("Please enter a target price");
  });

  it("exibe o erro de preço inválido ao salvar com um valor não numérico", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, { crypto: "bitcoin", price: "abc" });
    await act(async () => {
      result.current.screen.handleSave();
    });

    expect(result.current.screen.errors.price).toBe("Please enter a valid price");
  });

  it("exibe o erro de preço inválido ao salvar com preço zero", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, { crypto: "bitcoin", price: "0" });
    await act(async () => {
      result.current.screen.handleSave();
    });

    expect(result.current.screen.errors.price).toBe("Please enter a valid price");
  });

  it("não exibe erros antes de o usuário tentar salvar", async () => {
    const { result } = await renderCreateAlertHook();

    expect(result.current.screen.errors).toEqual({});
  });

  it("não adiciona o alerta e não navega quando o formulário é inválido", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, { price: "70000" });
    await act(async () => {
      result.current.screen.handleSave();
    });

    expect(result.current.context.alerts).toEqual([]);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("adiciona o alerta ao contexto quando o formulário é válido", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, {
      crypto: "bitcoin",
      price: "70000",
      condition: "below",
    });
    await act(async () => {
      result.current.screen.handleSave();
    });

    await waitFor(() =>
      expect(result.current.context.alerts).toHaveLength(1),
    );
    expect(result.current.context.alerts[0]).toMatchObject({
      cryptocurrency: "Bitcoin",
      symbol: "BTC",
      targetPrice: 70000,
      condition: "below",
    });
  });

  it("navega para a lista de alertas depois de salvar", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, { crypto: "bitcoin", price: "70000" });
    await act(async () => {
      result.current.screen.handleSave();
    });

    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith("/alerts");
  });

  it("não adiciona o alerta quando a moeda selecionada não existe na lista", async () => {
    const { result } = await renderCreateAlertHook();

    await fillForm(result.current.screen, {
      crypto: "moeda-inexistente",
      price: "70000",
    });
    await act(async () => {
      result.current.screen.handleSave();
    });

    expect(result.current.context.alerts).toEqual([]);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("volta para a tela anterior ao executar goBack", async () => {
    const { result } = await renderCreateAlertHook();

    await act(async () => {
      result.current.screen.goBack();
    });

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("monta as opções de cryptocurrencies a partir da lista estática", async () => {
    const { result } = await renderCreateAlertHook();

    expect(result.current.screen.cryptoOptions[0]).toEqual({
      value: "bitcoin",
      title: "Bitcoin",
      subtitle: "BTC",
    });
    expect(result.current.screen.cryptoOptions.length).toBeGreaterThan(1);
  });
});
