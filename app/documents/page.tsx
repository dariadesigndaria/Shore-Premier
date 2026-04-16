"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UploadCard from "@/components/form/UploadCard";

// ─── Slot definitions ─────────────────────────────────────────────────────────

interface SlotDef {
  key: string;
  label: string;
  sublabel?: string;
}

const W2_SLOTS: SlotDef[] = [
  { key: "w2_2023", label: "2023 W-2" },
  { key: "w2_2024", label: "2024 W-2" },
  { key: "paystub", label: "Recent pay stub with YTD income" },
  { key: "ptr_2024", label: "2024 Personal Tax Returns (All Schedules)", sublabel: "Optional" },
  { key: "ptr_2025", label: "2025 Personal Returns (All Schedules)", sublabel: "Optional" },
  { key: "btr_2024", label: "2024 Business Tax Returns (All Schedules)", sublabel: "Optional" },
  { key: "btr_2025", label: "2025 Business Tax Returns (All Schedules)", sublabel: "Optional" },
];

const SELF_EMPLOYED_SLOTS: SlotDef[] = [
  { key: "ptr_2023", label: "2023 Personal Tax Return (All Schedules)" },
  { key: "ptr_2024", label: "2024 Personal Tax Return (All Schedules)" },
  { key: "btr_2023", label: "2023 Business Tax Returns (All Schedules)", sublabel: "Optional" },
  { key: "btr_2024", label: "2024 Business Tax Returns (All Schedules)", sublabel: "Optional" },
  { key: "pnl", label: "Signed and Dated Year to Date Profit & Loss", sublabel: "Optional" },
];

// Slots for secondary self-employed income source
const SELF_EMPLOYED_SECONDARY_SLOTS: SlotDef[] = [
  { key: "btr_2023", label: "2023 Business Tax Returns (All Schedules)" },
  { key: "btr_2024", label: "2024 Business Tax Returns (All Schedules)" },
  { key: "pnl", label: "Signed and Dated Year to Date Profit & Loss", sublabel: "Optional" },
];

const RETIRED_SLOTS: SlotDef[] = [
  { key: "award_letter", label: "Most recent retirement award letter", sublabel: "e.g., Social Security, pension, or annuity" },
  { key: "ptr_2025", label: "2025 Personal Tax Returns (All Schedules)", sublabel: "Optional" },
  { key: "ytd_statement", label: "Year-to-date retirement income statement" },
  { key: "ira_dist", label: "IRA, 401(k), or annuity distribution statements", sublabel: "If applicable" },
];

const OTHER_SLOTS: SlotDef[] = [
  { key: "ptr_2024", label: "2024 Personal Tax Return (All Schedules)", sublabel: "all schedules" },
  { key: "ptr_2025", label: "2025 Personal Tax Return", sublabel: "all schedules" },
  { key: "f1099", label: "1099 forms", sublabel: "e.g., contract work, royalties, etc." },
  { key: "court_agreements", label: "Court-ordered agreements", sublabel: "e.g., alimony, child support, legal settlements" },
  { key: "rental", label: "Rental income statements", sublabel: "along with tax returns or leases" },
  { key: "trust", label: "Trust income or investment income statements" },
  { key: "other_steady", label: "Any official documentation showing a steady income stream" },
];

function getSlotsForType(empType: string): SlotDef[] {
  switch (empType) {
    case "self_employed": return SELF_EMPLOYED_SLOTS;
    case "retired":       return RETIRED_SLOTS;
    case "other":         return OTHER_SLOTS;
    default:              return W2_SLOTS;
  }
}

function getSlotsForSource(empType: string, sourceIdx: number): SlotDef[] {
  if (empType === "self_employed" && sourceIdx > 0) return SELF_EMPLOYED_SECONDARY_SLOTS;
  return getSlotsForType(empType);
}

function gridCols(empType: string, sourceIdx = 0): string {
  if (empType === "self_employed" && sourceIdx > 0) return "grid-cols-2";
  return empType === "w2" ? "grid-cols-3" : "grid-cols-2";
}

// ─── localStorage helper ──────────────────────────────────────────────────────

function readLS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-poppins), Poppins, sans-serif",
        fontWeight: 500, fontSize: "22px", lineHeight: "32px", color: "#2f2f39",
      }}
    >
      {children}
    </h2>
  );
}

function UploadAllNote({ text = "Upload all to proceed" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      {/* Megaphone outline icon */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 5.5H3.5L7.5 2.5V11.5L3.5 8.5H1.5C1.224 8.5 1 8.276 1 8V6C1 5.724 1.224 5.5 1.5 5.5Z" stroke="#727279" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 8.5V11.5" stroke="#727279" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M9.5 4.5C10.163 5.163 10.5 6 10.5 7C10.5 8 10.163 8.837 9.5 9.5" stroke="#727279" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M11 3C12.163 4.163 12.75 5.5 12.75 7C12.75 8.5 12.163 9.837 11 11" stroke="#727279" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
      <p
        style={{
          fontFamily: "var(--font-figtree), Figtree, sans-serif",
          fontWeight: 400, fontSize: "13px", lineHeight: "18px", color: "#727279",
        }}
      >
        {text}
      </p>
    </div>
  );
}

function SourceLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-figtree), Figtree, sans-serif",
        fontWeight: 600, fontSize: "14px", lineHeight: "20px", color: "#3c3c46",
      }}
    >
      {label}
    </p>
  );
}

function WhyAsked() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 text-left"
      >
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-150 ${open ? "" : "-rotate-90"}`}
        >
          <path d="M3 6L8 11L13 6" stroke="#3c3c46" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 500, fontSize: "14px", lineHeight: "20px", color: "#3c3c46",
          }}
        >
          Why is this asked?
        </span>
      </button>

      {open && (
        <div
          className="flex flex-col gap-2 rounded-[6px] px-4 py-4"
          style={{ background: "#f9f5ff", border: "1px solid rgba(75,14,163,0.08)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 400, fontSize: "13px", lineHeight: "20px", color: "#3c3c46",
            }}
          >
            We require ID, financial, and supporting documents to:
          </p>
          {[
            "Confirm your identity and protect against fraud",
            "Verify income, assets, and liabilities for accurate loan review",
            "Meet legal and compliance requirements (KYC/AML)",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span style={{ color: "#4b0ea3", marginTop: 2 }}>•</span>
              <p
                style={{
                  fontFamily: "var(--font-figtree), Figtree, sans-serif",
                  fontWeight: 400, fontSize: "13px", lineHeight: "20px", color: "#3c3c46",
                }}
              >
                {item}
              </p>
            </div>
          ))}
          <p
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 400, fontSize: "13px", lineHeight: "20px", color: "#3c3c46",
              marginTop: 4,
            }}
          >
            Your information is kept <strong>secure</strong> and used only for loan evaluation purposes.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Slot grid ────────────────────────────────────────────────────────────────

function SlotGrid({
  slots,
  prefix,
  cols,
  files,
  onChange,
}: {
  slots: SlotDef[];
  prefix: string;
  cols: string;
  files: Record<string, File | null>;
  onChange: (key: string, file: File | null) => void;
}) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {slots.map((s) => {
        const k = `${prefix}${s.key}`;
        return (
          <UploadCard
            key={k}
            label={s.label}
            sublabel={s.sublabel}
            file={files[k] ?? null}
            onFileChange={(f) => onChange(k, f)}
          />
        );
      })}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function DocumentsForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "individual";
  const done = searchParams.get("done") ?? "";
  const isCoBorrower = type === "co-borrower";

  const [empType, setEmpType] = useState("w2");
  const [isUSResident, setIsUSResident] = useState(true);
  const [sourceCount, setSourceCount] = useState(1);

  useEffect(() => {
    const emp = readLS<{ employmentType?: string }>("easyfund_employment");
    setEmpType(emp?.employmentType || "w2");

    const about = readLS<{ country?: string }>("easyfund_about_you");
    setIsUSResident(about?.country === "us");

    const income = readLS<{ hasAdditionalIncome?: string; extras?: unknown[] }>("easyfund_income");
    const extras = income?.extras?.length ?? 0;
    setSourceCount(income?.hasAdditionalIncome === "yes" ? 1 + extras : 1);
  }, []);

  // ── File state ──
  const [files, setFiles] = useState<Record<string, File | null>>({});
  function handleFile(key: string, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  // ── Bank statement multi-upload ──
  // Starts with one empty slot; when the last slot gets a file, a new empty slot appears
  const [bankSlots, setBankSlots] = useState<{ id: string; file: File | null }[]>([
    { id: "bs_0", file: null },
  ]);

  function handleBankSlot(slotId: string, file: File | null) {
    setBankSlots((prev) => {
      const updated = prev.map((s) => (s.id === slotId ? { ...s, file } : s));
      // If the last slot now has a file, append a new empty slot
      if (updated[updated.length - 1].file !== null) {
        updated.push({ id: `bs_${Date.now()}`, file: null });
      }
      return updated;
    });
  }

  // ── Personal Financial Statement ──
  const [pfsFile, setPfsFile] = useState<File | null>(null);

  function handleSaveNext() {
    if (isCoBorrower) {
      router.push(`/documents/co-borrower?type=${type}&done=${done}`);
    } else {
      alert("Application submitted successfully! Our team will be in touch shortly.");
    }
  }

  const ctaLabel = isCoBorrower ? "Save & Proceed" : "Save & Finish";
  const hasMultiple = sourceCount > 1 && isUSResident;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9f9f9" }}>
      {/* Header */}
      <header
        className="w-full shrink-0 flex items-center justify-center"
        style={{ height: 64, background: "#ffffff", borderBottom: "1px solid rgba(112,128,144,0.08)" }}
      >
        <p
          style={{
            fontFamily: "var(--font-red-hat-display), 'Red Hat Display', sans-serif",
            fontWeight: 700, fontSize: "22px", letterSpacing: "-0.7px", color: "#2f2f39",
          }}
        >
          EasyFund
        </p>
      </header>

      {/* Scrollable body */}
      <div className="flex flex-col items-center px-6 pt-12 flex-1">
        <div className="flex flex-col gap-10 w-full max-w-[564px] pb-16">

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                fontWeight: 500, fontSize: "32px", lineHeight: "44px",
                letterSpacing: "-0.2px", color: "#2f2f39",
              }}
            >
              Upload Required Documents to Continue
            </h1>
            <p
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400, fontSize: "14px", lineHeight: "20px", color: "#727279",
              }}
            >
              Max 20MB per file. Supported formats: PDF, DOC, DOCX, JPG, PNG, HEIC, HEIF.
            </p>
          </div>

          {/* ── Bank Statement section ── */}
          <div className="flex flex-col gap-4">
            {/* Dynamic bank statement slots (2-col grid) */}
            <div className="grid grid-cols-2 gap-4">
              {bankSlots.map((slot) => (
                <UploadCard
                  key={slot.id}
                  label="Most Recent Bank Statement"
                  file={slot.file}
                  onFileChange={(f) => handleBankSlot(slot.id, f)}
                />
              ))}
            </div>

            {/* Purchase Agreement — left cell only */}
            <div className="grid grid-cols-2 gap-4">
              <UploadCard
                label="Purchase Agreement"
                sublabel="Optional"
                file={files["purchase_agreement"] ?? null}
                onFileChange={(f) => handleFile("purchase_agreement", f)}
              />
              <div />
            </div>

            <WhyAsked />
          </div>

          {/* ── Personal Financial Statement ── */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <SectionTitle>Personal Financial Statement</SectionTitle>
              <UploadAllNote />
            </div>

            {/* Equal-height row: dashed upload card + Create New Statement card */}
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {/* Left: upload existing — fills the row height */}
              <UploadCard
                label="Upload Existing Statement"
                file={pfsFile}
                onFileChange={setPfsFile}
                fill
              />

              {/* Right: Create New Statement — shadow only, no border */}
              <div
                className="flex flex-col rounded-[4px] bg-white p-5 gap-3"
                style={{ boxShadow: "0px 4px 32px 0px rgba(140,140,140,0.24)" }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-figtree), Figtree, sans-serif",
                    fontWeight: 600, fontSize: "14px", lineHeight: "20px", color: "#2f2f39",
                  }}
                >
                  Create New Statement
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-figtree), Figtree, sans-serif",
                    fontWeight: 400, fontSize: "13px", lineHeight: "20px", color: "#727279",
                  }}
                >
                  Don&apos;t have a statement ready? We&apos;ll guide you through our secure form to create a professional document.
                </p>
                <button
                  type="button"
                  className="flex items-center justify-center h-9 px-4 rounded-[4px] cursor-pointer mt-auto"
                  style={{ background: "#22222d" }}
                  onClick={() => alert("Guided form coming soon.")}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-figtree), Figtree, sans-serif",
                      fontWeight: 500, fontSize: "13px", lineHeight: "18px", color: "#ffffff",
                    }}
                  >
                    Start Guided Form
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Proof of Income ── */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <SectionTitle>Proof of Income</SectionTitle>
              <UploadAllNote
                text={
                  empType === "retired" || empType === "other"
                    ? "Upload any of these to proceed"
                    : "Upload all to proceed"
                }
              />
            </div>

            {/* Non-US: single generic card */}
            {!isUSResident && (
              <UploadCard
                tall
                label="Upload Income Documents"
                sublabel="Upload up to 20 files. Max 20MB per file. Supported formats: PDF, DOC, DOCX, JPG, PNG, HEIC, HEIF."
                file={files["poi_generic"] ?? null}
                onFileChange={(f) => handleFile("poi_generic", f)}
              />
            )}

            {/* US + Single source */}
            {isUSResident && !hasMultiple && (
              <SlotGrid
                slots={getSlotsForType(empType)}
                prefix="poi_s0_"
                cols={gridCols(empType, 0)}
                files={files}
                onChange={handleFile}
              />
            )}

            {/* US + Multiple sources */}
            {isUSResident && hasMultiple && (
              <div className="flex flex-col gap-8">
                {Array.from({ length: sourceCount }, (_, idx) => {
                  const sourceLabel =
                    idx === 0 ? "First Income Source" :
                    idx === 1 ? "Second Income Source" :
                    idx === 2 ? "Third Income Source" :
                    `Income Source ${idx + 1}`;

                  const slots = getSlotsForSource(empType, idx);
                  const cols = gridCols(empType, idx);

                  return (
                    <div key={idx} className="flex flex-col gap-4">
                      <SourceLabel label={sourceLabel} />
                      <SlotGrid
                        slots={slots}
                        prefix={`poi_s${idx}_`}
                        cols={cols}
                        files={files}
                        onChange={handleFile}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── CTA buttons — normal document flow ── */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              className="flex items-center justify-center h-10 px-6 rounded-[4px] border border-[#dcdcde] bg-white hover:bg-[#f9f9f9] transition-colors cursor-pointer shrink-0"
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 500, fontSize: "15px", lineHeight: "22px", color: "#2f2f39",
                whiteSpace: "nowrap",
              }}
            >
              Upload Later
            </button>

            <button
              type="button"
              onClick={handleSaveNext}
              className="flex flex-1 items-center justify-center gap-2 h-10 rounded-[4px] cursor-pointer"
              style={{ background: "#4b0ea3", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-figtree), Figtree, sans-serif",
                  fontWeight: 600, fontSize: "15px", lineHeight: "22px", color: "#ffffff",
                }}
              >
                {ctaLabel}
              </span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.75 9H14.25M14.25 9L10.5 5.25M14.25 9L10.5 12.75" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function DocumentsFormWrapper() {
  return <DocumentsForm />;
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f9f9]" />}>
      <DocumentsFormWrapper />
    </Suspense>
  );
}
