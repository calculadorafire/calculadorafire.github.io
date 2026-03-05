import type { AssetClass, AssetClassParams, AssetAllocation, Assumptions, ReturnMode } from "./types";

export const ASSET_CLASS_PARAMS: Record<AssetClass, AssetClassParams> = {
  tesouroSelic: {
    label: "Tesouro Selic",
    meanReturn: 0.1075,
    stdDev: 0.005,
    taxCategory: "rendaFixa",
  },
  tesouroIpca: {
    label: "Tesouro IPCA+",
    meanReturn: 0.10,
    stdDev: 0.06,
    taxCategory: "rendaFixa",
  },
  cdb: {
    label: "CDB",
    meanReturn: 0.11,
    stdDev: 0.005,
    taxCategory: "rendaFixa",
  },
  lciLca: {
    label: "LCI/LCA",
    meanReturn: 0.095,
    stdDev: 0.005,
    taxCategory: "isento",
  },
  acoes: {
    label: "Ações (IBOVESPA)",
    meanReturn: 0.12,
    stdDev: 0.22,
    taxCategory: "rendaVariavel",
  },
  fiis: {
    label: "FIIs",
    meanReturn: 0.10,
    stdDev: 0.12,
    taxCategory: "fii",
  },
};

export const ASSET_CLASSES: AssetClass[] = [
  "tesouroSelic",
  "tesouroIpca",
  "cdb",
  "lciLca",
  "acoes",
  "fiis",
];

export const DEFAULT_ALLOCATION: AssetAllocation = {
  tesouroSelic: 20,
  tesouroIpca: 20,
  cdb: 15,
  lciLca: 15,
  acoes: 20,
  fiis: 10,
};

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  inflation: 0.04,
  safeWithdrawalRate: 0.04,
  includeInss: false,
  inssBenefit: 0,
  inssEligibilityAge: 65,
  lifeExpectancy: 90,
};

export const DEFAULT_RETURN_MODE: ReturnMode = {
  useSimpleReturn: false,
  simpleReturnRate: 0.08,
};

export const TAX_RATES = {
  rendaFixa: 0.175,
  rendaVariavel: 0.175,
  dividendos: 0.10,
  dividendosThreshold: 50_000,
  capitalGainsExemptionQuarterly: 60_000,
  comeCotas: 0.175,
} as const;

export const CORRELATION_MATRIX: number[][] = [
  // Selic, IPCA+, CDB, LCI/LCA, Ações, FIIs
  [1.0, 0.3, 0.9, 0.9, -0.1, 0.0],
  [0.3, 1.0, 0.3, 0.3, 0.1, 0.2],
  [0.9, 0.3, 1.0, 0.9, -0.1, 0.0],
  [0.9, 0.3, 0.9, 1.0, -0.1, 0.0],
  [-0.1, 0.1, -0.1, -0.1, 1.0, 0.5],
  [0.0, 0.2, 0.0, 0.0, 0.5, 1.0],
];

export const MONTE_CARLO_SIMULATIONS = 1000;

export const SWR_ANALYSIS_RATES = [0.03, 0.035, 0.04, 0.045, 0.05];

export const FIELD_DESCRIPTIONS: Record<string, string> = {
  patrimonioLiquido:
    "Soma de todos os seus bens e investimentos, menos suas dívidas. Inclui saldo em conta, investimentos, imóveis (valor de mercado) e outros ativos.",
  renda:
    "Sua renda bruta total, incluindo salário, renda de aluguéis, freelances e outras fontes. Pode ser informada mensal ou anualmente.",
  despesas:
    "Total dos seus gastos recorrentes: moradia, alimentação, transporte, saúde, lazer, etc. Quanto menor suas despesas, mais rápido você atinge o FIRE.",
  aporte:
    "Valor que você investe regularmente além das despesas. É a diferença entre sua renda e seus gastos que vai para investimentos.",
  inflacao:
    "Índice oficial de inflação do Brasil. Mede a variação de preços ao consumidor. A média histórica recente gira em torno de 4-5% ao ano.",
  taxaRetirada:
    "Percentual do patrimônio que você retira anualmente na aposentadoria. A regra clássica dos 4% sugere que esse valor é sustentável por 30+ anos, mas no Brasil recomenda-se entre 3,5% e 4%.",
  beneficioInss:
    "Valor mensal estimado que você receberá do INSS ao atingir a idade de elegibilidade. Reduz o valor que seu patrimônio precisa gerar.",
  tesouroSelic:
    "Título público pós-fixado que acompanha a taxa Selic. Baixíssimo risco, alta liquidez. Ideal para reserva de emergência.",
  tesouroIpca:
    "Título público que paga a inflação (IPCA) mais uma taxa fixa. Protege o poder de compra no longo prazo. Pode ter volatilidade se vendido antes do vencimento.",
  cdb:
    "Certificado de Depósito Bancário. Empréstimo ao banco com rendimento atrelado ao CDI. Protegido pelo FGC até R$ 250 mil por instituição.",
  lciLca:
    "Letras de Crédito Imobiliário/do Agronegócio. Similar ao CDB, mas isento de imposto de renda para pessoa física. Rendimento geralmente menor que CDB, mas o líquido pode ser superior.",
  acoes:
    "Investimento em empresas da bolsa brasileira. Maior potencial de retorno, mas com alta volatilidade. Recomendado para horizontes longos.",
  fiis:
    "Fundos de Investimento Imobiliário. Cotas negociadas em bolsa que investem em imóveis ou títulos imobiliários. Distribuem rendimentos mensais isentos de IR (sob certas condições).",
};
