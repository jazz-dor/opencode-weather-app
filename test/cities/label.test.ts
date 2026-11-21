import { describe, expect, test } from "bun:test";
import { cityLabel } from "../../src/cities/label.ts";
import { makeCity } from "../support/fixtures.ts";

describe("cityLabel", () => {
  test("incluye admin1 y país cuando existen", () => {
    expect(cityLabel(makeCity())).toBe("Ottawa (Ontario, Canadá)");
  });

  test("incluye solo el país si no hay admin1", () => {
    expect(cityLabel(makeCity({ admin1: undefined }))).toBe("Ottawa (Canadá)");
  });

  test("incluye solo admin1 si no hay país", () => {
    expect(cityLabel(makeCity({ country: undefined }))).toBe("Ottawa (Ontario)");
  });

  test("devuelve solo el nombre si no hay extras", () => {
    expect(
      cityLabel(makeCity({ country: undefined, admin1: undefined })),
    ).toBe("Ottawa");
  });

  test("ignora cadenas vacías", () => {
    expect(cityLabel(makeCity({ country: "", admin1: "" }))).toBe("Ottawa");
  });
});
