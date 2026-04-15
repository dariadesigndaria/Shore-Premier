"use client";

import { CheckmarkIcon } from "@/components/icons";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      className="flex items-start gap-3 cursor-pointer bg-transparent border-none p-0"
      onClick={() => onChange(!checked)}
    >
      {/* Box */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          border: `1.5px solid ${checked ? "#4b0ea3" : "#dcdcde"}`,
          background: checked ? "#4b0ea3" : "#ffffff",
          transition: "background 0.15s, border-color 0.15s",
          marginTop: 2,
        }}
      >
        {checked && <CheckmarkIcon fill="white" size={14} />}
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-figtree), Figtree, sans-serif",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
          color: "#2f2f39",
        }}
      >
        {label}
      </span>
    </button>
  );
}
