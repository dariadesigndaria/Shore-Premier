"use client";

import { InputHTMLAttributes, ReactNode, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  rightIcon?: ReactNode;
  error?: string;
}

export default function Input({
  label,
  required,
  rightIcon,
  error,
  className = "",
  value,
  onChange,
  ...props
}: InputProps) {
  const id = useId();
  const filled = Boolean(value);

  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative flex items-center h-[48px] px-3 rounded-[2px] border bg-white transition-colors
          ${error ? "border-red-500" : "border-[#dcdcde]"}
          has-[input:focus]:border-[#4b0ea3] has-[input:focus]:shadow-[0_0_0_2px_rgba(75,14,163,0.08)]
          hover:border-[#a6a6ab]
          ${className}`}
      >
        {/* Floating label */}
        <label
          htmlFor={id}
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
        </label>

        <input
          id={id}
          value={value}
          onChange={onChange}
          {...props}
          className="absolute inset-0 w-full h-full bg-transparent outline-none border-none px-3 pr-9"
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#2f2f39",
            paddingTop: filled ? "20px" : "0px",
          }}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none z-10">
            {rightIcon}
          </div>
        )}
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
