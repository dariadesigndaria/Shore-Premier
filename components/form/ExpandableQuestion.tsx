"use client";

import { useState } from "react";
import { ChevronUpIcon, ChevronDownExpandIcon } from "@/components/icons";

interface ExpandableQuestionProps {
  answer: string;
  defaultOpen?: boolean;
}

export default function ExpandableQuestion({ answer, defaultOpen = true }: ExpandableQuestionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <button
      type="button"
      className="flex gap-3 items-start w-full text-left cursor-pointer"
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div className="shrink-0 mt-1">
        {isOpen ? <ChevronUpIcon /> : <ChevronDownExpandIcon />}
      </div>
      <div className="flex flex-col gap-1 flex-1 items-start justify-center">
        <p
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "28px",
            color: "#2f2f39",
            whiteSpace: "nowrap",
          }}
        >
          Why is this asked?
        </p>
        {isOpen && (
          <p
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "24px",
              color: "#3c3c46",
            }}
          >
            {answer}
          </p>
        )}
      </div>
    </button>
  );
}
