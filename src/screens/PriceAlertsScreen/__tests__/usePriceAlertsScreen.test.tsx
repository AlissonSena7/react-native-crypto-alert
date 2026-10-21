import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AlertProvider } from "@context/AlertProvider/AlertProvider";
import { usePriceAlertsScreen } from "@screens/PriceAlertsScreen/usePriceAlertsScreen";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
}));

const mockRouter = router as jest.Mocked<typeof router>;

const STORAGE_KEY = "cryptoAlerts";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AlertProvider>{children}</AlertProvider>;
}

describe("usePriceAlertsScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("expõe a lista de alertas do contexto", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: "alert-1",
          cryptocurrency: "Bitcoin",
          symbol: "BTC",
          targetPrice: 70000,
          condition: "above",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );

    const { result } = await renderHook(() => usePriceAlertsScreen(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.alerts).toHaveLength(1));
    expect(result.current.alerts[0].cryptocurrency).toBe("Bitcoin");
  });

  it("expõe uma lista vazia quando não há alertas salvos", async () => {
    const { result } = await renderHook(() => usePriceAlertsScreen(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.alerts).toEqual([]));
  });

  it("remove um alerta ao chamar deleteAlert", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: "alert-1",
          cryptocurrency: "Bitcoin",
          symbol: "BTC",
          targetPrice: 70000,
          condition: "above",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );

    const { result } = await renderHook(() => usePriceAlertsScreen(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.alerts).toHaveLength(1));

    await act(async () => {
      result.current.deleteAlert("alert-1");
    });

    await waitFor(() => expect(result.current.alerts).toHaveLength(0));
  });

  it("navega para a tela de criação de alerta ao chamar goToCreate", async () => {
    const { result } = await renderHook(() => usePriceAlertsScreen(), {
      wrapper,
    });

    await act(async () => {
      result.current.goToCreate();
    });

    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith("/alerts/create");
  });
});
