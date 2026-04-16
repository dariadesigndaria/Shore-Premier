"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Re-use the same DocumentsForm logic but with co-borrower data.
// We dynamically import the form component to keep the file small.

function readLS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

// Lazy-load the documents form to avoid duplicating all the code.
// We pass co-borrower overrides via props.
import dynamic from "next/dynamic";

// The documents page exports DocumentsForm as a named export so we can
// re-use it. But since we used a default export only, we'll import the
// whole page and override via URL params — or more cleanly, extract the
// shared form to a separate module.
//
// For simplicity, this page rebuilds the co-borrower variant inline,
// pointing to the co-borrower's employment type and residency.

import UploadCard from "@/components/form/UploadCard";
import { useRouter } from "next/navigation";

// ─── Slot definitions (same as documents page) ────────────────────────────────

interface SlotDef { key: string; label: string; sublabel?: string; }

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

function getSlotsForType(t: string): SlotDef[] {
  switch (t) {
    case "self_employed": return SELF_EMPLOYED_SLOTS;
    case "retired":       return RETIRED_SLOTS;
    case "other":         return OTHER_SLOTS;
    default:              return W2_SLOTS;
  }
}

function gridCols(t: string) { return t === "w2" ? "grid-cols-3" : "grid-cols-2"; }

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 500, fontSize: "22px", lineHeight: "32px", color: "#2f2f39" }}>
      {children}
    </h2>
  );
}

function UploadAllNote({ text = "Upload all to proceed" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="6" width="10" height="7.5" rx="1" stroke="#727279" strokeWidth="1.2" />
        <path d="M4.5 6V4.5C4.5 3.119 5.619 2 7 2C8.381 2 9.5 3.119 9.5 4.5V6" stroke="#727279" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <p style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 400, fontSize: "13px", lineHeight: "18px", color: "#727279" }}>
        {text}
      </p>
    </div>
  );
}

function WhyAsked() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={() => setOpen(v => !v)} className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 text-left">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-150 ${open ? "" : "-rotate-90"}`}>
          <path d="M3 6L8 11L13 6" stroke="#3c3c46" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 500, fontSize: "14px", lineHeight: "20px", color: "#3c3c46" }}>
          Why is this asked?
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-2 rounded-[6px] px-4 py-4" style={{ background: "#f9f5ff", border: "1px solid rgba(75,14,163,0.08)" }}>
          <p style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 400, fontSize: "13px", lineHeight: "20px", color: "#3c3c46" }}>
            We require ID, financial, and supporting documents to:
          </p>
          {["Confirm your identity and protect against fraud", "Verify income, assets, and liabilities for accurate loan review", "Meet legal and compliance requirements (KYC/AML)"].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span style={{ color: "#4b0ea3", marginTop: 2 }}>•</span>
              <p style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 400, fontSize: "13px", lineHeight: "20px", color: "#3c3c46" }}>{item}</p>
            </div>
          ))}
          <p style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 400, fontSize: "13px", lineHeight: "20px", color: "#3c3c46", marginTop: 4 }}>
            Your information is kept <strong>secure</strong> and used only for loan evaluation purposes.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main co-borrower form ────────────────────────────────────────────────────

function CoBorrowerDocumentsForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") ?? "individual";
  const done = searchParams.get("done") ?? "";

  const [empType, setEmpType] = useState("w2");
  const [isUSResident, setIsUSResident] = useState(true);

  useEffect(() => {
    const cb = readLS<{ employmentType?: string; countryOfResidence?: string }>("easyfund_co_borrower");
    setEmpType(cb?.employmentType || "w2");
    setIsUSResident(cb?.countryOfResidence === "us");
  }, []);

  const [files, setFiles] = useState<Record<string, File | null>>({});
  function handleFile(key: string, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  const [pfsFile, setPfsFile] = useState<File | null>(null);

  function handleSaveFinish() {
    alert("Application submitted successfully! Our team will be in touch shortly.");
  }

  const slots = getSlotsForType(empType);
  const cols = gridCols(empType);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9f9f9" }}>
      {/* Header */}
      <header className="w-full shrink-0 flex items-center justify-center" style={{ height: 64, background: "#ffffff", borderBottom: "1px solid rgba(112,128,144,0.08)" }}>
        <p style={{ fontFamily: "var(--font-red-hat-display), 'Red Hat Display', sans-serif", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.7px", color: "#2f2f39" }}>
          EasyFund
        </p>
      </header>

      <div className="flex flex-col items-center px-6 pt-12 pb-32 flex-1">
        <div className="flex flex-col gap-10 w-full max-w-[564px]">

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 500, fontSize: "32px", lineHeight: "44px", letterSpacing: "-0.2px", color: "#2f2f39" }}>
              Upload Co-Borrower&apos;s Documents to Continue
            </h1>
            <p style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "20px", color: "#727279" }}>
              Max 20MB per file. Supported formats: PDF, DOC, DOCX, JPG, PNG, HEIC, HEIF.
            </p>
          </div>

          {/* Bank Statement */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <UploadCard label="Bank Statement" file={files["bank_primary"] ?? null} onFileChange={(f) => handleFile("bank_primary", f)} />
              <UploadCard label="Most Recent Bank Statement" sublabel="Optional" file={files["bank_recent"] ?? null} onFileChange={(f) => handleFile("bank_recent", f)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <UploadCard label="Purchase Agreement" sublabel="Optional" file={files["purchase_agreement"] ?? null} onFileChange={(f) => handleFile("purchase_agreement", f)} />
              <div />
            </div>
            <WhyAsked />
          </div>

          {/* Personal Financial Statement */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <SectionTitle>Personal Financial Statement</SectionTitle>
              <UploadAllNote />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <UploadCard label="Upload Existing Statement" file={pfsFile} onFileChange={setPfsFile} />
              <div className="flex flex-col rounded-[4px] border border-[#dcdcde] bg-white p-5 gap-3">
                <p style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 600, fontSize: "14px", lineHeight: "20px", color: "#2f2f39" }}>Create New Statement</p>
                <p style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 400, fontSize: "13px", lineHeight: "20px", color: "#727279" }}>
                  Don&apos;t have a statement ready? We&apos;ll guide you through our secure form to create a professional document.
                </p>
                <button type="button" className="flex items-center justify-center h-9 px-4 rounded-[4px] cursor-pointer" style={{ background: "#22222d" }} onClick={() => alert("Guided form coming soon.")}>
                  <span style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 500, fontSize: "13px", lineHeight: "18px", color: "#ffffff" }}>Start Guided Form</span>
                </button>
              </div>
            </div>
          </div>

          {/* Proof of Income */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <SectionTitle>Proof of Income</SectionTitle>
              <UploadAllNote text={empType === "retired" || empType === "other" ? "Upload any of these to proceed" : "Upload all to proceed"} />
            </div>

            {!isUSResident ? (
              <UploadCard tall label="Upload Income Documents" sublabel="Upload up to 20 files. Max 20MB per file. Supported formats: PDF, DOC, DOCX, JPG, PNG, HEIC, HEIF." file={files["poi_generic"] ?? null} onFileChange={(f) => handleFile("poi_generic", f)} />
            ) : (
              <div className={`grid ${cols} gap-4`}>
                {slots.map((s) => (
                  <UploadCard key={s.key} label={s.label} sublabel={s.sublabel} file={files[`poi_${s.key}`] ?? null} onFileChange={(f) => handleFile(`poi_${s.key}`, f)} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sticky footer */}
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-center px-6 py-4" style={{ background: "#ffffff", borderTop: "1px solid #ebebed", zIndex: 40 }}>
        <div className="flex items-center gap-4 w-full max-w-[564px]">
          <button type="button" className="flex items-center justify-center h-10 px-6 rounded-[4px] border border-[#dcdcde] bg-white hover:bg-[#f9f9f9] transition-colors cursor-pointer" style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 500, fontSize: "15px", lineHeight: "22px", color: "#2f2f39", whiteSpace: "nowrap" }}>
            Upload Later
          </button>
          <button type="button" onClick={handleSaveFinish} className="flex flex-1 items-center justify-center gap-2 h-10 rounded-[4px] cursor-pointer" style={{ background: "#4b0ea3", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 600, fontSize: "15px", lineHeight: "22px", color: "#ffffff" }}>Save &amp; Finish</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.75 9H14.25M14.25 9L10.5 5.25M14.25 9L10.5 12.75" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function CoBorrowerDocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f9f9]" />}>
      <CoBorrowerDocumentsForm />
    </Suspense>
  );
}
