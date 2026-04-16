"use client";

import { useRef } from "react";

const ACCEPTED = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.heif";
const MAX_MB = 20;

export interface UploadCardProps {
  label: string;
  sublabel?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  tall?: boolean; // full-width, shorter height (for "Upload Income Documents" generic card)
}

export default function UploadCard({ label, sublabel, file, onFileChange, tall }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function trigger() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      if (f.size > MAX_MB * 1024 * 1024) {
        alert(`File exceeds the ${MAX_MB}MB limit.`);
        return;
      }
      onFileChange(f);
    }
    e.target.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onFileChange(null);
  }

  return (
    <div className={tall ? "w-full" : "w-full"}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleChange}
        className="sr-only"
      />

      {file ? (
        /* ── Uploaded state ── */
        <div
          className="flex flex-col bg-white rounded-[4px] border border-[#dcdcde] p-3 w-full"
          style={{ minHeight: tall ? 72 : 100 }}
        >
          {/* Top row: file icon + name */}
          <div className="flex items-start gap-2 flex-1 mb-3">
            <svg
              width="14" height="16" viewBox="0 0 14 16" fill="none"
              xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-px"
            >
              <path
                d="M8.5 1H2.5C1.948 1 1.5 1.448 1.5 2V14C1.5 14.552 1.948 15 2.5 15H11.5C12.052 15 12.5 14.552 12.5 14V5L8.5 1Z"
                stroke="#727279" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path d="M8.5 1V5H12.5" stroke="#727279" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400, fontSize: "13px", lineHeight: "18px",
                color: "#2f2f39", wordBreak: "break-all",
              }}
            >
              {file.name}
            </p>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={trigger}
              className="flex items-center gap-[5px] h-7 px-3 rounded-[3px] border border-[#dcdcde] bg-white hover:bg-[#f9f9fb] transition-colors cursor-pointer"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 2L9 4L3.5 9.5H1.5V7.5L7 2Z" stroke="#2f2f39" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 3L8 5" stroke="#2f2f39" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontSize: "12px", fontWeight: 400, color: "#2f2f39" }}>
                Edit
              </span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center justify-center h-7 w-7 rounded-[3px] border border-[#dcdcde] bg-white hover:bg-[#fff4f4] transition-colors cursor-pointer"
              aria-label="Remove file"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 3.5H11.5M4.5 3.5V2H8.5V3.5M10.5 3.5L9.75 11H3.25L2.5 3.5" stroke="#727279" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* ── Empty / upload state ── */
        <button
          type="button"
          onClick={trigger}
          className="flex flex-col items-center justify-center w-full rounded-[4px] cursor-pointer hover:bg-[rgba(75,14,163,0.03)] transition-colors"
          style={{
            border: "1px dashed rgba(75,14,163,0.4)",
            background: "transparent",
            minHeight: tall ? 88 : 100,
            padding: "14px 16px",
            gap: 6,
          }}
        >
          {/* + icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3.5V16.5M3.5 10H16.5" stroke="#4b0ea3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          {/* Label */}
          <span
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 500, fontSize: "12px", lineHeight: "17px",
              color: "#4b0ea3", textAlign: "center",
            }}
          >
            {label}
          </span>

          {/* Sublabel */}
          {sublabel && (
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400, fontSize: "11px", lineHeight: "15px",
                color: "#727279", textAlign: "center",
              }}
            >
              {sublabel}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
