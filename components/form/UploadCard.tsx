"use client";

import { useRef } from "react";

const ACCEPTED = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.heif";
const MAX_MB = 20;

export interface UploadCardProps {
  label: string;
  sublabel?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  tall?: boolean;   // full-width tall generic upload zone
  fill?: boolean;   // stretch to fill parent container height (for PFS equal-height)
}

export default function UploadCard({ label, sublabel, file, onFileChange, tall, fill }: UploadCardProps) {
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

  const rootClass = `w-full${fill ? " h-full flex flex-col" : ""}`;

  return (
    <div className={rootClass}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleChange}
        className="sr-only"
      />

      {file ? (
        /* ── Uploaded state (Figma pixel-perfect) ── */
        <div
          className={`flex flex-col bg-white rounded-[4px] border border-[#dcdcde] w-full${fill ? " h-full" : ""}`}
          style={{ padding: 16, gap: 16, minHeight: tall ? 88 : 100 }}
        >
          {/* File row: icon + name side-by-side */}
          <div className="flex items-center" style={{ gap: 12 }}>
            {/* File icon 16×16 */}
            <svg
              width="16" height="16" viewBox="0 0 14 16" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M8.5 1H2.5C1.948 1 1.5 1.448 1.5 2V14C1.5 14.552 1.948 15 2.5 15H11.5C12.052 15 12.5 14.552 12.5 14V5L8.5 1Z"
                stroke="#727279" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path d="M8.5 1V5H12.5" stroke="#727279" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Filename */}
            <p
              className="flex-1 min-w-0 truncate"
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "27px",
                color: "#22222d",
              }}
            >
              {file.name}
            </p>
          </div>

          {/* Action row */}
          <div className="flex" style={{ gap: 12, height: 36 }}>
            {/* Edit — flex-1 */}
            <button
              type="button"
              onClick={trigger}
              className="flex flex-1 items-center justify-center rounded-[4px] border bg-white hover:bg-[#f9f9fb] transition-colors cursor-pointer"
              style={{
                borderColor: "#22222d",
                paddingLeft: 10,
                paddingRight: 10,
                gap: 6,
              }}
            >
              {/* Pen icon 16×16 */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 2.5L13.5 5L5.5 13H3V10.5L11 2.5Z" stroke="#2f2f39" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.5 4L12 6.5" stroke="#2f2f39" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-figtree), Figtree, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "#2f2f39",
                }}
              >
                Edit
              </span>
            </button>

            {/* Delete — 36×36 */}
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center justify-center rounded-[4px] border border-[#dcdcde] bg-white hover:bg-[#fff4f4] transition-colors cursor-pointer shrink-0"
              style={{ width: 36, height: 36 }}
              aria-label="Remove file"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4H14M5 4V2.5H11V4M13 4L12.25 13H3.75L3 4" stroke="#727279" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* ── Empty / upload state ── */
        <button
          type="button"
          onClick={trigger}
          className={`flex flex-col items-center justify-center w-full rounded-[4px] cursor-pointer hover:bg-[rgba(75,14,163,0.03)] transition-colors${fill ? " h-full" : ""}`}
          style={{
            border: "1px dashed #4b0ea3",
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
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "17px",
              color: "#4b0ea3",
              textAlign: "center",
            }}
          >
            {label}
          </span>

          {/* Sublabel */}
          {sublabel && (
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400,
                fontSize: "11px",
                lineHeight: "15px",
                color: "#727279",
                textAlign: "center",
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
