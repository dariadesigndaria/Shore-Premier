import React from "react";

interface StepHintProps {
  text: string;
}

export default function StepHint({ text }: StepHintProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Megaphone outline icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <path
          d="M2.667 5.667H5L10.667 3v10L5 10.333H2.667A1 1 0 0 1 1.667 9.333V6.667A1 1 0 0 1 2.667 5.667Z"
          stroke="#4b0ea3"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M5 10.333V13"
          stroke="#4b0ea3"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M12 6.5a2 2 0 0 1 0 3"
          stroke="#4b0ea3"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M13.5 5a3.5 3.5 0 0 1 0 6"
          stroke="#4b0ea3"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-figtree), Figtree, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          color: "#4b0ea3",
        }}
      >
        {text}
      </span>
    </div>
  );
}
