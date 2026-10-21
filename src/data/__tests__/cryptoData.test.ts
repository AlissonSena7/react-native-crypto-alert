import { fetchCryptocurrenciesFromApi } from "@data/cryptoData";

const fetchMock = jest.fn();

function mockApiResponse(
  payload: unknown,
  { ok = true, status = 200 }: { ok?: boolean; status?: number } = {},
) {
  fetchMock.mockResolvedValue({
    ok,
    status,
    json: async () => payload,
  });
}

const bitcoinPayload = {
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "btc",
  current_price: 67999.5,
  price_change_percentage_24h: 2.45,
  image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
};

describe("fetchCryptocurrenciesFromApi", () => {
  const originalApiKey = process.env.EXPO_PUBLIC_COINGECKO_API_KEY;

  beforeEach(() => {
    global.fetch = fetchMock as unknown as typeof global.fetch;
  });

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.EXPO_PUBLIC_COINGECKO_API_KEY;
    } else {
      process.env.EXPO_PUBLIC_COINGECKO_API_KEY = originalApiKey;
    }
  });

  it("mapeia a resposta da API para o modelo Cryptocurrency", async () => {
    mockApiResponse([bitcoinPayload]);

    const result = await fetchCryptocurrenciesFromApi();

    expect(result).toEqual([
      {
        id: "bitcoin",
        name: "Bitcoin",
        symbol: "BTC",
        price: 67999.5,
        change24h: 2.45,
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      },
    ]);
  });

  it("converte o símbolo da API para letras maiúsculas", async () => {
    mockApiResponse([{ ...bitcoinPayload, symbol: "eth" }]);

    const [coin] = await fetchCryptocurrenciesFromApi();

    expect(coin.symbol).toBe("ETH");
  });

  it("usa 0 como variação quando a API devolve null", async () => {
    mockApiResponse([
      { ...bitcoinPayload, price_change_percentage_24h: null },
    ]);

    const [coin] = await fetchCryptocurrenciesFromApi();

    expect(coin.change24h).toBe(0);
  });

  it("usa 0 como variação quando a API omite o campo de variação", async () => {
    const { price_change_percentage_24h, ...coinWithoutChange } =
      bitcoinPayload;
    mockApiResponse([coinWithoutChange]);

    const [coin] = await fetchCryptocurrenciesFromApi();

    expect(coin.change24h).toBe(0);
  });

  it("devolve uma lista vazia quando a API não retorna nenhuma moeda", async () => {
    mockApiResponse([]);

    await expect(fetchCryptocurrenciesFromApi()).resolves.toEqual([]);
  });

  it("lança um erro com o status HTTP quando a resposta não é ok", async () => {
    mockApiResponse(null, { ok: false, status: 503 });

    await expect(fetchCryptocurrenciesFromApi()).rejects.toThrow(
      "Failed to fetch cryptocurrencies: 503",
    );
  });

  it("consulta o endpoint de mercado com cotação em dólar", async () => {
    mockApiResponse([bitcoinPayload]);

    await fetchCryptocurrenciesFromApi();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("https://api.coingecko.com/api/v3/coins/markets");
    expect(url).toContain("vs_currency=usd");
    expect(url).toContain("order=market_cap_desc");
    expect(url).toContain("per_page=50");
    expect(url).toContain("page=1");
    expect(url).toContain("price_change_percentage=24h");
    expect(init.headers).toMatchObject({ Accept: "application/json" });
  });

  it("envia a chave da API no header quando a variável de ambiente está definida", async () => {
    process.env.EXPO_PUBLIC_COINGECKO_API_KEY = "test-key";
    mockApiResponse([bitcoinPayload]);

    await fetchCryptocurrenciesFromApi();

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).toMatchObject({ "x-cg-demo-api-key": "test-key" });
  });

  it("omite o header da chave quando a variável de ambiente não está definida", async () => {
    delete process.env.EXPO_PUBLIC_COINGECKO_API_KEY;
    mockApiResponse([bitcoinPayload]);

    await fetchCryptocurrenciesFromApi();

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).not.toHaveProperty("x-cg-demo-api-key");
  });
});
