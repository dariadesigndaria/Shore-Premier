"use client";

import { useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import { CalendarIcon } from "@/components/icons";

interface MonthYearPickerProps {
  label: string;
  required?: boolean;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  maxDate?: Date;
}

export default function MonthYearPicker({
  label,
  required,
  value,
  onChange,
  error,
  maxDate,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filled = Boolean(value);

  const formattedValue = value
    ? `${String(value.getMonth() + 1).padStart(2, "0")}/${value.getFullYear()}`
    : "";

  return (
    <div className="relative flex flex-col w-full" ref={containerRef}>
      <div
        className={`relative flex items-center h-[48px] px-3 rounded-[2px] border bg-white transition-colors cursor-pointer
          ${error ? "border-red-500" : open ? "border-[#4b0ea3] shadow-[0_0_0_2px_rgba(75,14,163,0.08)]" : "border-[#dcdcde]"}
          hover:border-[#a6a6ab]`}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Floating label */}
        <span
          className="absolute left-3 pointer-events-none select-none transition-all duration-150"
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
        </span>

        {/* Selected value */}
        {filled && (
          <span
            className="absolute left-3"
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#2f2f39",
              top: "20px",
            }}
          >
            {formattedValue}
          </span>
        )}

        {/* Calendar icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <CalendarIcon />
        </div>
      </div>

      {/* react-datepicker month/year picker as overlay */}
      {open && (
        <div className="absolute z-50 left-0 mt-1" style={{ top: "100%" }}>
          <ReactDatePicker
            selected={value}
            onChange={(date: Date | null) => {
              onChange(date);
              setOpen(false);
            }}
            onClickOutside={() => setOpen(false)}
            inline
            showMonthYearPicker
            maxDate={maxDate ?? new Date()}
            calendarClassName="yw-calendar"
          />
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
