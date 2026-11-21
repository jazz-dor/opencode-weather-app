export interface CapturedRequest {
  url: URL;
}

export interface FetchStub {
  requests: CapturedRequest[];
  restore: () => void;
}

export type Responder = (url: URL, init?: RequestInit) => Response | Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function mockFetch(responder: Responder): FetchStub {
  const original = globalThis.fetch;
  const requests: CapturedRequest[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof URL
      ? input
      : new URL(typeof input === "string" ? input : input.url);
    requests.push({ url });
    return responder(url, init);
  }) as typeof fetch;

  return {
    requests,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

export function lastRequest(stub: FetchStub): URL {
  const request = stub.requests.at(-1);
  if (!request) throw new Error("No se registró ninguna petición fetch");
  return request.url;
}
