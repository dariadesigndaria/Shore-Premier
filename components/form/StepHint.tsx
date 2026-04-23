import React from "react";

interface StepHintProps {
  text: string;
}

export default function StepHint({ text }: StepHintProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Megaphone outline icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, marginTop: 1 }}
      >
        <path
          d="M16.667 3.333v10l-6.667-2.5H5A1.667 1.667 0 0 1 3.333 9.167V7.5A1.667 1.667 0 0 1 5 5.833h5L16.667 3.333Z"
          stroke="#4b0ea3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.667 12.5v3.333"
          stroke="#4b0ea3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.167 5.833A3.333 3.333 0 0 1 19.167 10.833"
          stroke="#4b0ea3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
