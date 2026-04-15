"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

interface Option {
  value: string;
  label: string;
}

interface ComboSelectProps {
  label: string;
  required?: boolean;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export default function ComboSelect({
  label,
  required,
  options,
  value,
  onChange,
  error,
  className = "",
}: ComboSelectProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filled = Boolean(selectedOption);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function handleSelect(opt: Option) {
    onChange?.(opt.value);
    setOpen(false);
    setQuery("");
  }

  function handleOpen() {
    setOpen(true);
    setQuery("");
  }

  return (
    <div className={`relative flex flex-col w-full ${className}`} ref={containerRef}>
      <div
        className={`relative flex items-center h-[48px] px-3 rounded-[2px] border bg-white transition-colors cursor-pointer
          ${error ? "border-red-500" : open ? "border-[#4b0ea3] shadow-[0_0_0_2px_rgba(75,14,163,0.08)]" : "border-[#dcdcde]"}
          hover:border-[#a6a6ab]`}
        onClick={handleOpen}
      >
        {/* Floating label */}
        <label
          htmlFor={id}
          className="absolute left-3 pointer-events-none select-none transition-all duration-150 z-10"
          style={
            filled || open
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

        {open ? (
          /* Text input for filtering */
          <input
            id={id}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 w-full h-full bg-transparent outline-none border-none px-3 pr-9"
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#2f2f39",
              paddingTop: "20px",
            }}
            placeholder={selectedOption?.label ?? ""}
          />
        ) : (
          /* Display selected value */
          selectedOption && (
            <span
              className="absolute left-3 right-9"
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#2f2f39",
                top: "20px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedOption.label}
            </span>
          )
        )}

        {/* Chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <ChevronDownIcon
            className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown list */}
      {open && filtered.length > 0 && (
        <div
          className="absolute z-50 bg-white border border-[#dcdcde] rounded-[4px] overflow-y-auto"
          style={{
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            maxHeight: 200,
            boxShadow: "0px 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          {filtered.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center px-3 h-9 cursor-pointer hover:bg-[#f8f5fb] transition-colors"
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontSize: "14px",
                fontWeight: opt.value === value ? 600 : 400,
                color: opt.value === value ? "#4b0ea3" : "#2f2f39",
              }}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                handleSelect(opt);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}

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
