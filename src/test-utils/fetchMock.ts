/**
 * Utilitários de teste para o limite externo de rede (HTTP).
 * O `fetch` é o único ponto mockado: todo o código do app continua real.
 */
export const fetchMock = jest.fn();

export function installFetchMock() {
  global.fetch = fetchMock as unknown as typeof global.fetch;
}

export function mockJsonResponse(
  payload: unknown,
  { ok = true, status = 200 }: { ok?: boolean; status?: number } = {},
) {
  fetchMock.mockResolvedValue({
    ok,
    status,
    json: async () => payload,
  });
}

export function mockNetworkError(message = "Network request failed") {
  fetchMock.mockRejectedValue(new Error(message));
}

export function mockPendingRequest() {
  fetchMock.mockReturnValue(new Promise(() => {}));
}
