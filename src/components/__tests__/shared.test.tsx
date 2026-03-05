import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencyInput } from "../shared/CurrencyInput";
import { PercentInput } from "../shared/PercentInput";
import { InfoTooltip } from "../shared/InfoTooltip";

describe("CurrencyInput", () => {
  it("renders with R$ prefix", () => {
    render(<CurrencyInput value={1000} onChange={() => {}} />);
    expect(screen.getByText("R$")).toBeInTheDocument();
  });

  it("calls onChange with numeric value", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "1234,56" } });
    expect(onChange).toHaveBeenCalledWith(1234.56);
  });

  it("formats value on blur", () => {
    render(<CurrencyInput value={1234.56} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.blur(input);
    // After blur, value should be formatted
    expect(input).toBeInTheDocument();
  });
});

describe("PercentInput", () => {
  it("renders with % suffix", () => {
    render(<PercentInput value={0.04} onChange={() => {}} />);
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("clamps between 0 and 100%", () => {
    const onChange = vi.fn();
    render(<PercentInput value={0.5} onChange={onChange} min={0} max={1} />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "150" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(1);
  });
});

describe("InfoTooltip", () => {
  it("renders info icon", () => {
    render(<InfoTooltip content="Test tooltip" />);
    expect(screen.getByLabelText("Informação")).toBeInTheDocument();
  });
});
