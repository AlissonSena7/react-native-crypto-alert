import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useConversionScreen } from "@screens/ConversionScreen/useConversionScreen";
import {
  fetchMock,
  installFetchMock,
  mockJsonResponse,
  mockNetworkError,
} from "@/test-utils/fetchMock";

const apiCoins = [
  {
    id: "bitcoin",
    name: "Bitcoin API",
    symbol: "BTC",
    current_price: 100,
    price_change_percentage_24h: 1.5,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    id: "ethereum",
    name: "Ethereum API",
    symbol: "ETH",
    current_price: 50,
    price_change_percentage_24h: -0.5,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
];

describe("useConversionScreen", () => {
  beforeEach(() => {
    installFetchMock();
  });

  it("inicia sem valor digitado, com Bitcoin e dólar selecionados", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useConversionScreen());

    expect(result.current.amount).toBe("");
    expect(result.current.selectedCrypto).toBe("bitcoin");
    expect(result.current.selectedFiat).toBe("USD");
    expect(result.current.formattedResult).toBeNull();
    expect(result.current.showPlaceholder).toBe(true);
    expect(result.current.showInvalid).toBe(false);
  });

  it("usa os preços da API para calcular o valor convertido", async () => {
    mockJsonResponse(apiCoins);

    const { result } = await renderHook(() => useConversionScreen());
    await waitFor(() =>
      expect(result.current.cryptoOptions[0]?.title).toBe("Bitcoin API"),
    );

    await act(async () => {
      result.current.setAmount("2");
    });

    expect(result.current.formattedResult).toBe("$200.00");
    expect(result.current.showInvalid).toBe(false);
  });

  it("aplica a taxa da moeda fiat selecionada na conversão", async () => {
    mockJsonResponse(apiCoins);

    const { result } = await renderHook(() => useConversionScreen());
    await waitFor(() =>
      expect(result.current.cryptoOptions[0]?.title).toBe("Bitcoin API"),
    );

    await act(async () => {
      result.current.setAmount("2");
      result.current.setSelectedFiat("BRL");
    });

    expect(result.current.formattedResult).toBe("R$1,024.00");
  });

  it("exibe o placeholder enquanto nenhum valor foi digitado", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useConversionScreen());

    expect(result.current.showPlaceholder).toBe(true);
    expect(result.current.formattedResult).toBeNull();
  });

  it("marca o valor como inválido quando o texto não é numérico", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useConversionScreen());

    await act(async () => {
      result.current.setAmount("abc");
    });

    expect(result.current.showInvalid).toBe(true);
    expect(result.current.showPlaceholder).toBe(false);
    expect(result.current.formattedResult).toBeNull();
  });

  it("marca o valor como inválido quando o valor é zero", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useConversionScreen());

    await act(async () => {
      result.current.setAmount("0");
    });

    expect(result.current.showInvalid).toBe(true);
    expect(result.current.formattedResult).toBeNull();
  });

  it("marca o valor como inválido quando o valor é negativo", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useConversionScreen());

    await act(async () => {
      result.current.setAmount("-10");
    });

    expect(result.current.showInvalid).toBe(true);
    expect(result.current.formattedResult).toBeNull();
  });

  it("mantém a lista estática de criptomoedas quando a API falha", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useConversionScreen());

    await waitFor(() => expect(result.current.cryptoOptions.length).toBe(8));
    expect(result.current.cryptoOptions[0]).toEqual({
      value: "bitcoin",
      title: "Bitcoin",
      subtitle: "BTC",
    });
  });

  it("monta as opções de moedas fiat a partir da lista estática", async () => {
    mockNetworkError();

    const { result } = await renderHook(() => useConversionScreen());

    expect(result.current.fiatOptions[0]).toEqual({
      value: "USD",
      title: "USD",
      subtitle: "$",
    });
    expect(result.current.fiatOptions).toHaveLength(5);
  });

  it("recalcula o resultado quando a moeda selecionada muda", async () => {
    mockJsonResponse(apiCoins);

    const { result } = await renderHook(() => useConversionScreen());
    await waitFor(() =>
      expect(result.current.cryptoOptions[0]?.title).toBe("Bitcoin API"),
    );

    await act(async () => {
      result.current.setAmount("2");
    });
    expect(result.current.formattedResult).toBe("$200.00");

    await act(async () => {
      result.current.setSelectedCrypto("ethereum");
    });

    expect(result.current.formattedResult).toBe("$100.00");
  });
});
