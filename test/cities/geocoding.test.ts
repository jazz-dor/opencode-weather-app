import { afterEach, describe, expect, test } from "bun:test";
import { geocodeCity } from "../../src/cities/geocoding.ts";
import { jsonResponse, lastRequest, mockFetch } from "../support/mock-fetch.ts";
import type { FetchStub } from "../support/mock-fetch.ts";
import { geocodingPayload } from "../support/fixtures.ts";

describe("geocodeCity", () => {
  let stub: FetchStub;

  afterEach(() => {
    stub?.restore();
  });

  test("arma la URL con nombre, count=1, idioma es y formato json", async () => {
    stub = mockFetch(() => jsonResponse(geocodingPayload));
    await geocodeCity("Ottawa");

    const url = lastRequest(stub);
    expect(url.host).toBe("geocoding-api.open-meteo.com");
    expect(url.searchParams.get("name")).toBe("Ottawa");
    expect(url.searchParams.get("count")).toBe("1");
    expect(url.searchParams.get("language")).toBe("es");
    expect(url.searchParams.get("format")).toBe("json");
  });

  test("devuelve la ciudad mapeada del primer resultado", async () => {
    stub = mockFetch(() => jsonResponse(geocodingPayload));
    const city = await geocodeCity("Ottawa");

    expect(city).toEqual({
      name: "Ottawa",
      country: "Canadá",
      admin1: "Ontario",
      latitude: 45.41117,
      longitude: -75.69812,
    });
  });

  test("devuelve null si no hay resultados", async () => {
    stub = mockFetch(() => jsonResponse({}));
    expect(await geocodeCity("Atlantida")).toBeNull();
  });

  test("devuelve null si el resultado no tiene coordenadas", async () => {
    stub = mockFetch(() =>
      jsonResponse({ results: [{ name: "Raro" }] }),
    );
    expect(await geocodeCity("Raro")).toBeNull();
  });

  test("usa el nombre buscado cuando el resultado no trae nombre", async () => {
    stub = mockFetch(() =>
      jsonResponse({ results: [{ latitude: 1, longitude: 2 }] }),
    );
    const city = await geocodeCity("SinNombre");
    expect(city?.name).toBe("SinNombre");
  });

  test("lanza error cuando la petición falla", async () => {
    stub = mockFetch(() => jsonResponse({}, 503));
    await expect(geocodeCity("Ottawa")).rejects.toThrow(
      "Geocoding falló con estado 503",
    );
  });
});
