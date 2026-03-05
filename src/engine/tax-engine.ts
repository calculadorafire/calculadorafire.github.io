import type { AssetAllocation } from "./types";
import { ASSET_CLASS_PARAMS, ASSET_CLASSES, TAX_RATES } from "./constants";

export function calculateRendaFixaTax(gains: number): number {
  if (gains <= 0) return 0;
  return gains * TAX_RATES.rendaFixa;
}

export function calculateCapitalGainsTax(
  quarterlyVolume: number,
  gains: number
): number {
  if (gains <= 0) return 0;
  if (quarterlyVolume <= TAX_RATES.capitalGainsExemptionQuarterly) return 0;
  return gains * TAX_RATES.rendaVariavel;
}

export function calculateDividendTax(monthlyDividends: number): number {
  if (monthlyDividends <= TAX_RATES.dividendosThreshold) return 0;
  return monthlyDividends * TAX_RATES.dividendos;
}

export function calculateFiiDistributionTax(_distributions: number): number {
  return 0;
}

export function calculatePortfolioTax(
  allocation: AssetAllocation,
  totalGains: number
): number {
  if (totalGains <= 0) return 0;

  const totalAlloc = ASSET_CLASSES.reduce(
    (sum, key) => sum + allocation[key],
    0
  );
  if (totalAlloc === 0) return 0;

  let totalTax = 0;

  for (const key of ASSET_CLASSES) {
    const weight = allocation[key] / totalAlloc;
    const assetGains = totalGains * weight;
    const params = ASSET_CLASS_PARAMS[key];

    switch (params.taxCategory) {
      case "rendaFixa":
        totalTax += calculateRendaFixaTax(assetGains);
        break;
      case "isento":
        break;
      case "rendaVariavel":
        // For portfolio-level calculation, assume above exemption
        totalTax += assetGains * TAX_RATES.rendaVariavel;
        break;
      case "fii":
        // Distributions exempt, but capital gains on FII shares taxed
        // For simplification, treat FII total returns as partially exempt
        break;
    }
  }

  return totalTax;
}

export function getNetReturnRate(
  grossReturn: number,
  taxCategory: string
): number {
  switch (taxCategory) {
    case "rendaFixa":
      return grossReturn * (1 - TAX_RATES.rendaFixa);
    case "isento":
      return grossReturn;
    case "rendaVariavel":
      return grossReturn * (1 - TAX_RATES.rendaVariavel);
    case "fii":
      // FII distributions exempt, approximate net return
      return grossReturn * 0.95;
    default:
      return grossReturn;
  }
}
