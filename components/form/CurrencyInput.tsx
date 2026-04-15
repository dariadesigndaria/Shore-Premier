"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
];

interface CurrencyInputProps {
  label: string;
  required?: boolean;
  value: string;
  currency: string;
  onValueChange: (value: string) => void;
  onCurrencyChange: (currency: string) => void;
  error?: string;
}

export default function CurrencyInput({
  label,
  required,
  value,
  currency,
  onValueChange,
  onCurrencyChange,
  error,
}: CurrencyInputProps) {
  const id = useId();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const filled = Boolean(value);

  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative flex items-center h-[48px] rounded-[2px] border bg-white transition-colors
          ${error ? "border-red-500" : "border-[#dcdcde]"}
          has-[input:focus]:border-[#4b0ea3] has-[input:focus]:shadow-[0_0_0_2px_rgba(75,14,163,0.08)]
          hover:border-[#a6a6ab]`}
      >
        {/* Amount input area */}
        <div className="relative flex-1 flex items-center h-full px-3 min-w-0">
          {/* Floating label */}
          <label
            htmlFor={id}
            className="absolute left-0 pointer-events-none select-none transition-all duration-150"
            style={
              filled
                ? {
                    fontFamily: "var(--font-figtree), Figtree, sans-serif",
                    fontWeight: 500,
                    fontSize: "11px",
                    lineHeight: "16px",
                    color: "#a6a6ab",
                    top: "5px",
                  }
                : {
                    fontFamily: "var(--font-figtree), Figtree, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "#727279",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }
            }
          >
            {label}
            {required && <span style={{ fontWeight: 400 }}>*</span>}
          </label>

          <input
            id={id}
            type="number"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="absolute inset-0 w-full h-full bg-transparent outline-none border-none px-3"
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#2f2f39",
              paddingTop: filled ? "20px" : "0px",
            }}
          />
        </div>

        {/* Vertical divider */}
        <div
          className="shrink-0 self-stretch"
          style={{ width: 1, background: "#dcdcde", margin: "8px 0" }}
        />

        {/* Currency selector */}
        <div className="relative shrink-0">
          <button
            type="button"
            className="flex items-center gap-1 px-3 h-full cursor-pointer bg-transparent border-none"
            style={{ height: 48 }}
            onClick={() => setCurrencyOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={currencyOpen}
          >
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#2f2f39",
              }}
            >
              {currency}
            </span>
            <ChevronDownIcon />
          </button>

          {/* Currency dropdown */}
          {currencyOpen && (
            <div
              className="absolute right-0 z-50 bg-white border border-[#dcdcde] rounded-[4px] overflow-hidden"
              style={{
                top: "calc(100% + 4px)",
                minWidth: 80,
                boxShadow: "0px 4px 16px rgba(0,0,0,0.1)",
              }}
              role="listbox"
            >
              {CURRENCIES.map((c) => (
                <div
                  key={c.value}
                  role="option"
                  aria-selected={c.value === currency}
                  className="flex items-center px-3 h-9 cursor-pointer hover:bg-[#f8f5fb] transition-colors"
                  style={{
                    fontFamily: "var(--font-figtree), Figtree, sans-serif",
                    fontSize: "14px",
                    fontWeight: c.value === currency ? 600 : 400,
                    color: c.value === currency ? "#4b0ea3" : "#2f2f39",
                  }}
                  onClick={() => {
                    onCurrencyChange(c.value);
                    setCurrencyOpen(false);
                  }}
                >
                  {c.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontSize: "12px",
            color: "#bd0929",
            marginTop: "4px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
