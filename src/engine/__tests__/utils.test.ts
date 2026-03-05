import { describe, it, expect } from "vitest";
import { formatBRL, formatPercent, parseBRL, clamp, toAnnual } from "../utils";

describe("formatBRL", () => {
  it("formats 1234.56 correctly", () => {
    expect(formatBRL(1234.56)).toBe("R$\u00a01.234,56");
  });

  it("formats 0 correctly", () => {
    expect(formatBRL(0)).toBe("R$\u00a00,00");
  });

  it("formats 1_000_000 correctly", () => {
    expect(formatBRL(1_000_000)).toBe("R$\u00a01.000.000,00");
  });
});

describe("formatPercent", () => {
  it("formats 0.04 as 4,00%", () => {
    expect(formatPercent(0.04)).toBe("4,00%");
  });

  it("formats 0.175 as 17,50%", () => {
    expect(formatPercent(0.175)).toBe("17,50%");
  });
});

describe("parseBRL", () => {
  it('parses "R$ 1.234,56" to 1234.56', () => {
    expect(parseBRL("R$ 1.234,56")).toBeCloseTo(1234.56);
  });

  it('parses "1234,56" without prefix', () => {
    expect(parseBRL("1234,56")).toBeCloseTo(1234.56);
  });

  it("returns 0 for invalid input", () => {
    expect(parseBRL("abc")).toBe(0);
  });
});

describe("clamp", () => {
  it("returns value when in range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to min", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it("clamps to max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("toAnnual", () => {
  it("converts monthly to annual", () => {
    expect(toAnnual(5000, "mensal")).toBe(60000);
  });

  it("keeps annual as-is", () => {
    expect(toAnnual(60000, "anual")).toBe(60000);
  });
});
