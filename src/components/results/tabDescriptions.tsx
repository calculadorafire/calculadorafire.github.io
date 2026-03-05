import React from "react";
import { ASSET_CLASS_PARAMS, ASSET_CLASSES } from "@/engine/constants";

const TAX_CATEGORY_LABELS: Record<string, string> = {
  rendaFixa: "Renda Fixa (17,5%)",
  rendaVariavel: "Renda Variável (17,5%)",
  isento: "Isento",
  fii: "FII (dividendos isentos*)",
};

export function MonteCarloInfo() {
  return (
    <div className="space-y-3">
      <p>
        A <strong>Simulação Monte Carlo</strong> gera milhares de cenários aleatórios
        para projetar a evolução do seu patrimônio ao longo do tempo. Cada simulação
        aplica retornos anuais sorteados com base nos parâmetros de cada classe de
        ativo (média e desvio padrão), considerando correlações entre eles.
      </p>
      <h3 className="font-semibold">Como interpretar os percentis</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>P5</strong> — Piores 5% dos cenários. Se seu patrimônio fica positivo aqui, você tem alta segurança.</li>
        <li><strong>P25</strong> — Cenário pessimista moderado (quartil inferior).</li>
        <li><strong>P50 (Mediana)</strong> — Resultado típico. Metade dos cenários ficou acima e metade abaixo.</li>
        <li><strong>P75</strong> — Cenário otimista moderado (quartil superior).</li>
        <li><strong>P95</strong> — Melhores 5% dos cenários. Representa um resultado muito favorável.</li>
      </ul>
      <h3 className="font-semibold">Taxa de sucesso</h3>
      <p>
        Percentual de simulações em que o patrimônio não chegou a zero antes da
        expectativa de vida. Uma taxa acima de 80% é geralmente considerada segura,
        mas quanto maior, melhor.
      </p>
      <h3 className="font-semibold">O que afeta os resultados</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Patrimônio inicial e aportes mensais</li>
        <li>Alocação de ativos (risco vs. retorno)</li>
        <li>Despesas na aposentadoria (taxa de retirada)</li>
        <li>Inflação e tributação</li>
        <li>Horizonte de tempo (idade atual até expectativa de vida)</li>
      </ul>
    </div>
  );
}

export function AllocationInfo() {
  return (
    <div className="space-y-3">
      <p>
        A alocação de ativos distribui seu patrimônio entre diferentes classes de
        investimento, cada uma com características próprias de retorno esperado,
        risco (volatilidade) e tributação.
      </p>
      <h3 className="font-semibold">Parâmetros por classe de ativo</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1.5 font-medium">Ativo</th>
              <th className="text-left py-1.5 font-medium">Retorno Esperado</th>
              <th className="text-left py-1.5 font-medium">Volatilidade</th>
              <th className="text-left py-1.5 font-medium">Tributação</th>
            </tr>
          </thead>
          <tbody>
            {ASSET_CLASSES.map((key) => {
              const p = ASSET_CLASS_PARAMS[key];
              return (
                <tr key={key} className="border-b">
                  <td className="py-1.5">{p.label}</td>
                  <td className="py-1.5">{(p.meanReturn * 100).toFixed(1)}% a.a.</td>
                  <td className="py-1.5">{(p.stdDev * 100).toFixed(1)}%</td>
                  <td className="py-1.5">{TAX_CATEGORY_LABELS[p.taxCategory]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h3 className="font-semibold">Risco vs. Retorno</h3>
      <p>
        Ativos com maior retorno esperado (como ações) tendem a ter maior
        volatilidade. Diversificar entre classes com baixa correlação reduz o risco
        total da carteira sem necessariamente sacrificar retorno.
      </p>
    </div>
  );
}

export function WithdrawalInfo() {
  return (
    <div className="space-y-3">
      <p>
        A <strong>Taxa Segura de Retirada (SWR)</strong> é o percentual do
        patrimônio que você pode retirar anualmente na aposentadoria sem esgotar
        seus recursos antes do fim da vida.
      </p>
      <h3 className="font-semibold">A Regra dos 4%</h3>
      <p>
        Originada do <em>Trinity Study</em> (1998), a regra sugere que retirar 4%
        do patrimônio inicial ao ano (ajustado pela inflação) é sustentável por pelo
        menos 30 anos em ~95% dos cenários históricos nos EUA.
      </p>
      <h3 className="font-semibold">Contexto brasileiro</h3>
      <p>
        No Brasil, taxas de juros tendem a ser mais altas, mas a inflação também é
        maior e mais volátil. A recomendação para o investidor brasileiro costuma
        ficar entre <strong>3,5% e 4%</strong> ao ano, dependendo da alocação e do
        horizonte de tempo.
      </p>
      <h3 className="font-semibold">Como ler a tabela</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Taxa de Retirada</strong> — Percentual anual do patrimônio inicial retirado.</li>
        <li><strong>Taxa de Sucesso</strong> — Percentual de simulações Monte Carlo em que o patrimônio durou até a expectativa de vida.</li>
        <li><strong>Patrimônio Final (Mediana)</strong> — Valor mediano restante ao final do período nas simulações bem-sucedidas.</li>
      </ul>
    </div>
  );
}
