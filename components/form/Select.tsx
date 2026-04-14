import { useId } from "react";
import { ChevronDownIcon } from "@/components/icons";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  required?: boolean;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export default function Select({
  label,
  required,
  options,
  value,
  onChange,
  error,
  className = "",
}: SelectProps) {
  const id = useId();

  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative flex items-center h-[40px] px-3 rounded-[2px] border bg-white transition-colors cursor-pointer
          ${error ? "border-red-500" : "border-[#dcdcde]"}
          hover:border-[#a6a6ab]
          has-[select:focus]:border-[#4b0ea3] has-[select:focus]:shadow-[0_0_0_2px_rgba(75,14,163,0.08)]
          ${className}`}
      >
        {/* Placeholder label — hidden when value selected */}
        <label
          htmlFor={id}
          className="absolute left-3 flex items-center pointer-events-none select-none transition-opacity"
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#727279",
            opacity: value ? 0 : 1,
          }}
        >
          {label}
          {required && <span style={{ fontWeight: 400 }}>*</span>}
        </label>

        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="absolute inset-0 w-full h-full bg-transparent outline-none border-none appearance-none pl-3 pr-9 cursor-pointer"
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            color: value ? "#2f2f39" : "transparent",
          }}
        >
          <option value="" disabled />
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <ChevronDownIcon />
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
