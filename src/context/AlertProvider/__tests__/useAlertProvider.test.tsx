import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AlertProvider } from "@context/AlertProvider/AlertProvider";
import {
  useAlertProviderState,
  useAlerts,
} from "@context/AlertProvider/useAlertProvider";

const STORAGE_KEY = "cryptoAlerts";

const storedAlerts = [
  {
    id: "alert-1",
    cryptocurrency: "Bitcoin",
    symbol: "BTC",
    targetPrice: 70000,
    condition: "above",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "alert-2",
    cryptocurrency: "Ethereum",
    symbol: "ETH",
    targetPrice: 3000,
    condition: "below",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  return <AlertProvider>{children}</AlertProvider>;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("useAlertProviderState", () => {  it("inicia com a lista de alertas vazia", async () => {
    const { result } = await renderHook(() => useAlertProviderState());

    expect(result.current.alerts).toEqual([]);
  });

  it("hidrata os alertas salvos no armazenamento local", async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedAlerts));

    const { result } = await renderHook(() => useAlertProviderState());

    await waitFor(() => expect(result.current.alerts).toHaveLength(2));
    expect(result.current.alerts[0]).toEqual(storedAlerts[0]);
    expect(result.current.alerts[1]).toEqual(storedAlerts[1]);
  });

  it("mantém a lista vazia quando o armazenamento local não possui alertas", async () => {
    const { result } = await renderHook(() => useAlertProviderState());

    await waitFor(() => expect(result.current.alerts).toEqual([]));
  });

  it("adiciona um alerta com identificador e data de criação", async () => {
    const { result } = await renderHook(() => useAlertProviderState());

    await act(async () => {
      result.current.addAlert({
        cryptocurrency: "Bitcoin",
        symbol: "BTC",
        targetPrice: 70000,
        condition: "above",
      });
    });

    await waitFor(() => expect(result.current.alerts).toHaveLength(1));
    const [alert] = result.current.alerts;
    expect(alert.id).toEqual(expect.any(String));
    expect(alert.id.length).toBeGreaterThan(0);
    expect(alert.createdAt).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(alert.createdAt))).toBe(false);
    expect(alert).toMatchObject({
      cryptocurrency: "Bitcoin",
      symbol: "BTC",
      targetPrice: 70000,
      condition: "above",
    });
  });

  it("persiste os alertas no armazenamento local após adicionar um alerta", async () => {
    const { result } = await renderHook(() => useAlertProviderState());

    await act(async () => {
      result.current.addAlert({
        cryptocurrency: "Ethereum",
        symbol: "ETH",
        targetPrice: 3000,
        condition: "below",
      });
    });

    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        cryptocurrency: "Ethereum",
        symbol: "ETH",
        targetPrice: 3000,
        condition: "below",
      });
    });
  });

  it("acumula vários alertas adicionados", async () => {
    const { result } = await renderHook(() => useAlertProviderState());

    await act(async () => {
      result.current.addAlert({
        cryptocurrency: "Bitcoin",
        symbol: "BTC",
        targetPrice: 70000,
        condition: "above",
      });
      result.current.addAlert({
        cryptocurrency: "Solana",
        symbol: "SOL",
        targetPrice: 200,
        condition: "below",
      });
    });

    await waitFor(() => expect(result.current.alerts).toHaveLength(2));
    expect(result.current.alerts.map((alert) => alert.cryptocurrency)).toEqual([
      "Bitcoin",
      "Solana",
    ]);
  });

  it("remove o alerta pelo identificador", async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedAlerts));

    const { result } = await renderHook(() => useAlertProviderState());
    await waitFor(() => expect(result.current.alerts).toHaveLength(2));

    await act(async () => {
      result.current.deleteAlert("alert-1");
    });

    await waitFor(() => expect(result.current.alerts).toHaveLength(1));
    expect(result.current.alerts[0].id).toBe("alert-2");
  });

  it("ignora a remoção de um identificador inexistente", async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedAlerts));

    const { result } = await renderHook(() => useAlertProviderState());
    await waitFor(() => expect(result.current.alerts).toHaveLength(2));

    await act(async () => {
      result.current.deleteAlert("alert-inexistente");
    });

    expect(result.current.alerts).toHaveLength(2);
  });

  it("persiste a remoção no armazenamento local", async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedAlerts));

    const { result } = await renderHook(() => useAlertProviderState());
    await waitFor(() => expect(result.current.alerts).toHaveLength(2));

    await act(async () => {
      result.current.deleteAlert("alert-1");
    });

    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw as string);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe("alert-2");
    });
  });
});

describe("useAlerts", () => {
  it("lança erro quando é usado fora do AlertProvider", async () => {
    await expect(renderHook(() => useAlerts())).rejects.toThrow(
      "useAlerts must be used within AlertProvider",
    );
  });

  it("devolve os alertas e as ações do contexto quando está dentro do AlertProvider", async () => {
    const { result } = await renderHook(() => useAlerts(), { wrapper });

    expect(result.current.alerts).toEqual([]);
    expect(typeof result.current.addAlert).toBe("function");
    expect(typeof result.current.deleteAlert).toBe("function");
  });
});
