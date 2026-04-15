"use client";

import { useId, useRef, useEffect, useState } from "react";
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
  const [focused, setFocused] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filled = Boolean(value);
  const raised = filled || focused;

  // Close currency dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    if (currencyOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currencyOpen]);

  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative flex items-center h-[48px] px-3 rounded-[2px] border bg-white transition-colors
          ${error ? "border-red-500" : focused ? "border-[#4b0ea3] shadow-[0_0_0_2px_rgba(75,14,163,0.08)]" : "border-[#dcdcde]"}
          hover:border-[#a6a6ab]`}
      >
        {/* Floating label */}
        <label
          htmlFor={id}
          className="absolute left-3 pointer-events-none select-none transition-all duration-150 z-10"
          style={
            raised
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

        {/* Amount input */}
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute inset-0 w-full h-full bg-transparent outline-none border-none px-3"
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#2f2f39",
            paddingTop: raised ? "20px" : "0px",
            paddingRight: "88px", // leave room for currency chip
          }}
        />

        {/* Currency chip — positioned inside field on the right */}
        <div ref={dropdownRef} className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
          <button
            type="button"
            onClick={() => setCurrencyOpen((v) => !v)}
            className="flex items-center gap-1 rounded-[4px] cursor-pointer border-none outline-none"
            style={{
              height: 24,
              paddingLeft: 6,
              paddingRight: 4,
              background: "#f9fafb",
            }}
            aria-haspopup="listbox"
            aria-expanded={currencyOpen}
          >
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#2f2f39",
              }}
            >
              {currency}
            </span>
            <ChevronDownIcon
              className={`transition-transform duration-150 ${currencyOpen ? "rotate-180" : ""}`}
            />
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
                  onMouseDown={(e) => {
                    e.preventDefault();
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
