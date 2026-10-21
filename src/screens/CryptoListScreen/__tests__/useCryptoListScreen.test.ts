import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCryptoListScreen } from "@screens/CryptoListScreen/useCryptoListScreen";
import {
  fetchMock,
  installFetchMock,
  mockJsonResponse,
  mockNetworkError,
  mockPendingRequest,
} from "@/test-utils/fetchMock";

const apiCoins = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    current_price: 67999.5,
    price_change_percentage_24h: 2.45,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    current_price: 3850.25,
    price_change_percentage_24h: -1.23,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
];

describe("useCryptoListScreen", () => {
  beforeEach(() => {
    installFetchMock();
  });

  it("inicia no estado de carregamento enquanto a requisição está em andamento", async () => {
    mockPendingRequest();

    const { result } = await renderHook(() => useCryptoListScreen());

    expect(result.current.loadingState).toBe("loading");
  });

  it("carrega as moedas da API e libera a lista quando a requisição termina", async () => {
    mockJsonResponse(apiCoins);

    const { result } = await renderHook(() => useCryptoListScreen());

    await waitFor(() => expect(result.current.loadingState).toBe("idle"));
    expect(result.current.cryptocurrencies).toEqual([
      {
        id: "bitcoin",
        name: "Bitcoin",
        symbol: "BTC",
        price: 67999.5,
        change24h: 2.45,
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      },
      {
        id: "ethereum",
        name: "Ethereum",
        symbol: "ETH",
        price: 3850.25,
        change24h: -1.23,
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      },
    ]);
  });

  it("entra no estado de erro e mantém a lista estática quando a API falha", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useCryptoListScreen());

    await waitFor(() => expect(result.current.loadingState).toBe("error"));
    expect(result.current.cryptocurrencies.length).toBeGreaterThan(0);
    expect(result.current.cryptocurrencies[0].id).toBe("bitcoin");
  });

  it("entra no estado vazio quando a API não retorna nenhuma moeda", async () => {
    mockJsonResponse([]);

    const { result } = await renderHook(() => useCryptoListScreen());

    await waitFor(() => expect(result.current.loadingState).toBe("empty"));
    expect(result.current.cryptocurrencies).toEqual([]);
  });

  it("entra no estado de erro quando a API responde com status de falha", async () => {
    mockJsonResponse(null, { ok: false, status: 500 });

    const { result } = await renderHook(() => useCryptoListScreen());

    await waitFor(() => expect(result.current.loadingState).toBe("error"));
  });

  it("carrega os dados novamente ao executar handleRetry", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useCryptoListScreen());
    await waitFor(() => expect(result.current.loadingState).toBe("error"));

    mockJsonResponse(apiCoins);
    await act(async () => {
      result.current.handleRetry();
    });

    await waitFor(() => expect(result.current.loadingState).toBe("idle"));
    expect(result.current.cryptocurrencies).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
