import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div />,
  Cell: () => <div />,
  Legend: () => <div />,
}));

describe("Home Page", () => {
  it("renders the page title", () => {
    render(<Home />);
    expect(
      screen.getByText("Calculadora FIRE Brasil")
    ).toBeInTheDocument();
  });

  it("renders form sections", () => {
    render(<Home />);
    expect(screen.getByText("Dados Pessoais")).toBeInTheDocument();
    expect(screen.getByText("Situação Financeira")).toBeInTheDocument();
    expect(screen.getByText(/Alocação de Ativos/)).toBeInTheDocument();
    expect(screen.getByText("Premissas")).toBeInTheDocument();
  });

  it("renders results tabs", () => {
    render(<Home />);
    expect(screen.getByText("Projeção")).toBeInTheDocument();
    expect(screen.getByText("Monte Carlo")).toBeInTheDocument();
    expect(screen.getByText("Alocação")).toBeInTheDocument();
    expect(screen.getByText("Análise de Retirada")).toBeInTheDocument();
  });

  it("shows FIRE summary with default values", () => {
    render(<Home />);
    expect(screen.getByTestId("fire-number")).toBeInTheDocument();
    expect(screen.getByTestId("years-to-fire")).toBeInTheDocument();
  });
});
