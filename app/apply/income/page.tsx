"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import CurrencyInput from "@/components/form/CurrencyInput";
import MonthYearPicker from "@/components/form/MonthYearPicker";
import ExpandableQuestion from "@/components/form/ExpandableQuestion";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";

// ─── Types ───────────────────────────────────────────────────────────────────

type IncomeType = "self_employed" | "w2" | "retired" | "other" | "";

interface PrevEmployerBlock {
  employerName: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface StoredPrevEmployerBlock {
  employerName: string;
  startDate: string | null;
  endDate: string | null;
}

// ── Primary additional income source ──
interface PrimaryIncome {
  incomeType: IncomeType;
  // self_employed
  businessName: string;
  // w2
  employerName: string;
  // shared self_employed + w2
  jobTitle: string;
  // all types
  monthlyIncome: string;
  incomeCurrency: string;
  // self_employed / w2 / other start date
  startDate: Date | null;
  // retired
  retirementStartDate: Date | null;
  // other
  incomeSource: string;
  // 2-year history blocks
  previousEmployers: PrevEmployerBlock[];
}

interface StoredPrimaryIncome {
  incomeType: IncomeType;
  businessName: string;
  employerName: string;
  jobTitle: string;
  monthlyIncome: string;
  incomeCurrency: string;
  startDate: string | null;
  retirementStartDate: string | null;
  incomeSource: string;
  previousEmployers: StoredPrevEmployerBlock[];
}

// ── Extra "Other Income" cards ──
interface ExtraIncomeEntry {
  id: string;
  employmentType: string;
  employerName: string;
  jobTitle: string;
  monthlyIncome: string;
  incomeCurrency: string;
  startDate: Date | null;
}

interface StoredExtraIncomeEntry {
  id: string;
  employmentType: string;
  employerName: string;
  jobTitle: string;
  monthlyIncome: string;
  incomeCurrency: string;
  startDate: string | null;
}

interface AdditionalIncomeState {
  hasAdditionalIncome: string; // "" | "yes" | "no"
  primary: PrimaryIncome;
  extras: ExtraIncomeEntry[];
}

interface StoredAdditionalIncomeState {
  hasAdditionalIncome: string;
  primary: StoredPrimaryIncome;
  extras: StoredExtraIncomeEntry[];
}

const STORAGE_KEY = "easyfund_income";

// ─── Serialization ────────────────────────────────────────────────────────────

function serializePrevBlock(b: PrevEmployerBlock): StoredPrevEmployerBlock {
  return {
    ...b,
    startDate: b.startDate ? b.startDate.toISOString() : null,
    endDate: b.endDate ? b.endDate.toISOString() : null,
  };
}

function deserializePrevBlock(b: StoredPrevEmployerBlock): PrevEmployerBlock {
  return {
    ...b,
    startDate: b.startDate ? new Date(b.startDate) : null,
    endDate: b.endDate ? new Date(b.endDate) : null,
  };
}

function serializeExtra(e: ExtraIncomeEntry): StoredExtraIncomeEntry {
  return { ...e, startDate: e.startDate ? e.startDate.toISOString() : null };
}

function deserializeExtra(e: StoredExtraIncomeEntry): ExtraIncomeEntry {
  return { ...e, startDate: e.startDate ? new Date(e.startDate) : null };
}

function emptyPrimary(): PrimaryIncome {
  return {
    incomeType: "",
    businessName: "",
    employerName: "",
    jobTitle: "",
    monthlyIncome: "",
    incomeCurrency: "USD",
    startDate: null,
    retirementStartDate: null,
    incomeSource: "",
    previousEmployers: [],
  };
}

function emptyPrevBlock(): PrevEmployerBlock {
  return { employerName: "", startDate: null, endDate: null };
}

function loadFromStorage(): AdditionalIncomeState {
  const empty: AdditionalIncomeState = {
    hasAdditionalIncome: "",
    primary: emptyPrimary(),
    extras: [],
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const stored: StoredAdditionalIncomeState = JSON.parse(raw);
    return {
      hasAdditionalIncome: stored.hasAdditionalIncome ?? "",
      primary: {
        ...stored.primary,
        startDate: stored.primary.startDate ? new Date(stored.primary.startDate) : null,
        retirementStartDate: stored.primary.retirementStartDate
          ? new Date(stored.primary.retirementStartDate)
          : null,
        previousEmployers: (stored.primary.previousEmployers ?? []).map(deserializePrevBlock),
      },
      extras: (stored.extras ?? []).map(deserializeExtra),
    };
  } catch {
    return empty;
  }
}

function saveToStorage(state: AdditionalIncomeState) {
  const stored: StoredAdditionalIncomeState = {
    hasAdditionalIncome: state.hasAdditionalIncome,
    primary: {
      ...state.primary,
      startDate: state.primary.startDate ? state.primary.startDate.toISOString() : null,
      retirementStartDate: state.primary.retirementStartDate
        ? state.primary.retirementStartDate.toISOString()
        : null,
      previousEmployers: state.primary.previousEmployers.map(serializePrevBlock),
    },
    extras: state.extras.map(serializeExtra),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

// ─── 2-year history logic ─────────────────────────────────────────────────────

function monthsAgo(date: Date): number {
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}

function getPrevBlocksNeeded(startDate: Date | null, blocks: PrevEmployerBlock[]): number {
  if (!startDate) return 0;
  if (monthsAgo(startDate) >= 24) return 0;
  for (let i = 0; i < 4; i++) {
    const b = blocks[i];
    if (!b?.startDate) return i + 1;
    if (monthsAgo(b.startDate) >= 24) return i + 1;
  }
  return 4;
}

// ─── Options ─────────────────────────────────────────────────────────────────

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "self_employed", label: "Self-Employed or Business Owner" },
  { value: "w2", label: "W-2 Employee" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
];

// ─── Styles ──────────────────────────────────────────────────────────────────

const mainTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "36px",
  lineHeight: "52px",
  letterSpacing: "-0.25px",
  color: "#2f2f39",
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-figtree), Figtree, sans-serif",
  fontWeight: 500,
  fontSize: "18px",
  lineHeight: "28px",
  color: "#3c3c46",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400,
  fontSize: "24px",
  lineHeight: "36px",
  letterSpacing: "0px",
  color: "#2f2f39",
};

const prevHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400,
  fontSize: "24px",
  lineHeight: "36px",
  letterSpacing: "0px",
  color: "#2f2f39",
};

// ─── Yes/No selector ─────────────────────────────────────────────────────────

function YesNoSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-5 w-full">
      {["yes", "no"].map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="flex flex-1 items-center justify-center px-5 py-2 rounded-[2px] border transition-colors cursor-pointer"
            style={{
              background: selected ? "#fcfafe" : "#ffffff",
              borderColor: selected ? "#4b0ea3" : "#dcdcde",
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: selected ? 500 : 400,
              fontSize: "18px",
              lineHeight: "28px",
              color: selected ? "#4b0ea3" : "#2f2f39",
            }}
          >
            {opt === "yes" ? "Yes" : "No"}
          </button>
        );
      })}
    </div>
  );
}

// ─── Employment type 2×2 grid ─────────────────────────────────────────────────

function IncomeTypeGrid({
  value,
  onChange,
}: {
  value: IncomeType;
  onChange: (v: IncomeType) => void;
}) {
  const options: { value: IncomeType; label: string }[] = [
    { value: "self_employed", label: "Self-Employed or Business Owner" },
    { value: "w2", label: "W‑2 Employee" },
    { value: "retired", label: "Retired" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="grid grid-cols-2 gap-5 w-full">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center justify-center px-5 rounded-[2px] border transition-colors cursor-pointer"
            style={{
              height: 72,
              background: selected ? "#fcfafe" : "#ffffff",
              borderColor: selected ? "#4b0ea3" : "#dcdcde",
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: selected ? 500 : 400,
              fontSize: "18px",
              lineHeight: "28px",
              color: selected ? "#4b0ea3" : "#2f2f39",
              textAlign: "center",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Previous employer block (2-year history) ─────────────────────────────────

interface PrevBlockProps {
  index: number;
  block: PrevEmployerBlock;
  maxEndDate?: Date;
  onChange: (index: number, field: keyof PrevEmployerBlock, value: string | Date | null) => void;
}

function PrevEmployerBlockUI({ index, block, maxEndDate, onChange }: PrevBlockProps) {
  const headings = [
    "Tell us about your previous employer (within the last 2 years)",
    "And the employer before that",
    "Going further back",
    "One more previous employer",
  ];
  return (
    <div className="flex flex-col gap-5 w-full">
      <h2 style={prevHeadingStyle}>{headings[index] ?? "Previous employer"}</h2>
      <Input
        label="Employer Name"
        required
        value={block.employerName}
        onChange={(e) => onChange(index, "employerName", e.target.value)}
      />
      <div className="flex gap-5 w-full">
        <MonthYearPicker
          label="Start Date"
          required
          value={block.startDate}
          onChange={(date) => onChange(index, "startDate", date)}
          maxDate={maxEndDate ?? new Date()}
        />
        <MonthYearPicker
          label="End Date"
          required
          value={block.endDate}
          onChange={(date) => onChange(index, "endDate", date)}
          maxDate={maxEndDate ?? new Date()}
        />
      </div>
    </div>
  );
}

// ─── Extra income card (compact) ──────────────────────────────────────────────

interface ExtraCardProps {
  entry: ExtraIncomeEntry;
  index: number;
  onUpdate: (id: string, field: keyof ExtraIncomeEntry, value: string | Date | null) => void;
  onRemove: (id: string) => void;
}

function ExtraIncomeCard({ entry, index, onUpdate, onRemove }: ExtraCardProps) {
  return (
    <div
      className="flex flex-col gap-5 w-full rounded-[4px] p-4"
      style={{
        background: "#ffffff",
        boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between w-full">
        <span
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "28px",
            color: "#2f2f39",
          }}
        >
          Other Income {index + 1 > 1 ? index + 1 : ""}
        </span>
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="flex items-center justify-center rounded-[4px] border border-[#dcdcde] bg-transparent cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.04)]"
          style={{ width: 36, height: 36 }}
          aria-label="Remove income source"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="#2f2f39"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Row 1: Employment Type + Employer Name */}
      <div className="flex gap-5 w-full">
        <Select
          label="Employment Type"
          required
          options={EMPLOYMENT_TYPE_OPTIONS}
          value={entry.employmentType}
          onChange={(v) => onUpdate(entry.id, "employmentType", v)}
        />
        <Input
          label="Name of your employer"
          required
          value={entry.employerName}
          onChange={(e) => onUpdate(entry.id, "employerName", e.target.value)}
        />
      </div>

      {/* Row 2: Job Title + Monthly Income */}
      <div className="flex gap-5 w-full">
        <Input
          label="Job Title"
          value={entry.jobTitle}
          onChange={(e) => onUpdate(entry.id, "jobTitle", e.target.value)}
        />
        <CurrencyInput
          label="Monthly Income"
          required
          value={entry.monthlyIncome}
          currency={entry.incomeCurrency}
          onValueChange={(v) => onUpdate(entry.id, "monthlyIncome", v)}
          onCurrencyChange={(v) => onUpdate(entry.id, "incomeCurrency", v)}
        />
      </div>

      {/* Row 3: Start Date (full width) */}
      <MonthYearPicker
        label="Start Date"
        required
        value={entry.startDate}
        onChange={(date) => onUpdate(entry.id, "startDate", date)}
        maxDate={new Date()}
      />
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function IncomeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "";
  const done = searchParams.get("done") ?? "";

  const [state, setState] = useState<AdditionalIncomeState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // ── Helpers ──

  function updateHasIncome(v: string) {
    setState((prev) => ({ ...prev, hasAdditionalIncome: v }));
  }

  function updatePrimary<K extends keyof PrimaryIncome>(field: K, value: PrimaryIncome[K]) {
    setState((prev) => ({ ...prev, primary: { ...prev.primary, [field]: value } }));
  }

  function updatePrevBlock(
    index: number,
    field: keyof PrevEmployerBlock,
    value: string | Date | null
  ) {
    setState((prev) => {
      const blocks = [...prev.primary.previousEmployers];
      while (blocks.length <= index) blocks.push(emptyPrevBlock());
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...prev, primary: { ...prev.primary, previousEmployers: blocks } };
    });
  }

  function addExtraIncome() {
    const newEntry: ExtraIncomeEntry = {
      id: crypto.randomUUID(),
      employmentType: "",
      employerName: "",
      jobTitle: "",
      monthlyIncome: "",
      incomeCurrency: "USD",
      startDate: null,
    };
    setState((prev) => ({ ...prev, extras: [...prev.extras, newEntry] }));
  }

  function updateExtra(id: string, field: keyof ExtraIncomeEntry, value: string | Date | null) {
    setState((prev) => ({
      ...prev,
      extras: prev.extras.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  function removeExtra(id: string) {
    setState((prev) => ({ ...prev, extras: prev.extras.filter((e) => e.id !== id) }));
  }

  // ── Validation ──

  const { hasAdditionalIncome, primary, extras } = state;

  const primaryStartDate =
    primary.incomeType === "retired" ? primary.retirementStartDate : primary.startDate;
  const prevBlocksNeeded = getPrevBlocksNeeded(primaryStartDate, primary.previousEmployers);

  function primaryValid(): boolean {
    if (!primary.incomeType) return false;
    if (!primary.monthlyIncome.trim()) return false;

    if (primary.incomeType === "self_employed") {
      if (!primary.businessName.trim()) return false;
      if (!primary.jobTitle.trim()) return false;
      if (!primary.startDate) return false;
    } else if (primary.incomeType === "w2") {
      if (!primary.employerName.trim()) return false;
      if (!primary.jobTitle.trim()) return false;
      if (!primary.startDate) return false;
    } else if (primary.incomeType === "retired") {
      if (!primary.retirementStartDate) return false;
    } else if (primary.incomeType === "other") {
      if (!primary.incomeSource.trim()) return false;
      if (!primary.startDate) return false;
    }

    for (let i = 0; i < prevBlocksNeeded; i++) {
      const b = primary.previousEmployers[i];
      if (!b?.employerName.trim() || !b?.startDate || !b?.endDate) return false;
    }

    return true;
  }

  function extrasValid(): boolean {
    return extras.every(
      (e) => e.employmentType !== "" && e.employerName.trim() !== "" && e.monthlyIncome.trim() !== "" && e.startDate !== null
    );
  }

  const canProceed =
    hasAdditionalIncome === "no" ||
    (hasAdditionalIncome === "yes" && primaryValid() && extrasValid());

  function handleSaveNext() {
    if (!canProceed) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("income")) existingDone.push("income");
    router.push(`/apply/co-borrower?type=${type}&done=${existingDone.join(",")}`);
  }

  // ── Start date heading text ──
  function startDateHeading(): string {
    switch (primary.incomeType) {
      case "self_employed":
        return "How long have you been self-employed?";
      case "w2":
        return "When did you start working here?";
      case "retired":
        return "When did you retire?";
      case "other":
        return "When did this income start?";
      default:
        return "What is your start date?";
    }
  }

  return (
    <div className="relative flex flex-col gap-12 items-start overflow-x-hidden pb-14 pt-16 px-[276px] w-full">

      {/* Save & Exit */}
      <button
        type="button"
        className="absolute top-8 right-10 flex items-center justify-center h-10 px-5 rounded-[4px] border border-[#22222d] bg-transparent hover:bg-[rgba(34,34,45,0.04)] transition-colors cursor-pointer"
        style={{
          fontFamily: "var(--font-figtree), Figtree, sans-serif",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
          color: "#2f2f39",
        }}
      >
        Save &amp; Exit
      </button>

      <div className="flex flex-col gap-8 items-start w-[564px]">

        {/* ── Title ── */}
        <div className="flex flex-col gap-1 w-full">
          <h1 style={mainTitleStyle}>Do you have any other sources of income?</h1>
          <p style={subtitleStyle}>
            Please only include this income source if you have a 2 year history of receiving this income
          </p>
        </div>

        {/* ── Yes / No ── */}
        <YesNoSelector value={hasAdditionalIncome} onChange={updateHasIncome} />

        {/* ── Additional income form (only when "yes") ── */}
        {hasAdditionalIncome === "yes" && (
          <>
            {/* Employment / income type */}
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your employment type</h2>
              <IncomeTypeGrid value={primary.incomeType} onChange={(v) => updatePrimary("incomeType", v)} />
            </div>

            {/* ── Self-Employed fields ── */}
            {primary.incomeType === "self_employed" && (
              <>
                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your business name?</h2>
                  <Input
                    label="Business Name"
                    required
                    value={primary.businessName}
                    onChange={(e) => updatePrimary("businessName", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your current position/title?</h2>
                  <Input
                    label="Job Title"
                    required
                    value={primary.jobTitle}
                    onChange={(e) => updatePrimary("jobTitle", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your gross monthly income before taxes</h2>
                  <CurrencyInput
                    label="Monthly Income"
                    required
                    value={primary.monthlyIncome}
                    currency={primary.incomeCurrency}
                    onValueChange={(v) => updatePrimary("monthlyIncome", v)}
                    onCurrencyChange={(v) => updatePrimary("incomeCurrency", v)}
                  />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>{startDateHeading()}</h2>
                  <MonthYearPicker
                    label="Start Date"
                    required
                    value={primary.startDate}
                    onChange={(date) => updatePrimary("startDate", date)}
                    maxDate={new Date()}
                  />
                </div>

                {Array.from({ length: prevBlocksNeeded }, (_, i) => (
                  <PrevEmployerBlockUI
                    key={i}
                    index={i}
                    block={primary.previousEmployers[i] ?? emptyPrevBlock()}
                    maxEndDate={primary.startDate ?? new Date()}
                    onChange={updatePrevBlock}
                  />
                ))}
              </>
            )}

            {/* ── W-2 Employee fields ── */}
            {primary.incomeType === "w2" && (
              <>
                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your employer name?</h2>
                  <Input
                    label="Employer Name"
                    required
                    value={primary.employerName}
                    onChange={(e) => updatePrimary("employerName", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your current position/title?</h2>
                  <Input
                    label="Job Title"
                    required
                    value={primary.jobTitle}
                    onChange={(e) => updatePrimary("jobTitle", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your gross monthly income before taxes</h2>
                  <CurrencyInput
                    label="Monthly Income"
                    required
                    value={primary.monthlyIncome}
                    currency={primary.incomeCurrency}
                    onValueChange={(v) => updatePrimary("monthlyIncome", v)}
                    onCurrencyChange={(v) => updatePrimary("incomeCurrency", v)}
                  />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>{startDateHeading()}</h2>
                  <MonthYearPicker
                    label="Start Date"
                    required
                    value={primary.startDate}
                    onChange={(date) => updatePrimary("startDate", date)}
                    maxDate={new Date()}
                  />
                </div>

                {Array.from({ length: prevBlocksNeeded }, (_, i) => (
                  <PrevEmployerBlockUI
                    key={i}
                    index={i}
                    block={primary.previousEmployers[i] ?? emptyPrevBlock()}
                    maxEndDate={primary.startDate ?? new Date()}
                    onChange={updatePrevBlock}
                  />
                ))}
              </>
            )}

            {/* ── Retired fields ── */}
            {primary.incomeType === "retired" && (
              <>
                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your gross monthly income before taxes</h2>
                  <CurrencyInput
                    label="Monthly Income"
                    required
                    value={primary.monthlyIncome}
                    currency={primary.incomeCurrency}
                    onValueChange={(v) => updatePrimary("monthlyIncome", v)}
                    onCurrencyChange={(v) => updatePrimary("incomeCurrency", v)}
                  />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>{startDateHeading()}</h2>
                  <MonthYearPicker
                    label="Retirement Start Date"
                    required
                    value={primary.retirementStartDate}
                    onChange={(date) => updatePrimary("retirementStartDate", date)}
                    maxDate={new Date()}
                  />
                </div>

                {Array.from({ length: prevBlocksNeeded }, (_, i) => (
                  <PrevEmployerBlockUI
                    key={i}
                    index={i}
                    block={primary.previousEmployers[i] ?? emptyPrevBlock()}
                    maxEndDate={primary.retirementStartDate ?? new Date()}
                    onChange={updatePrevBlock}
                  />
                ))}
              </>
            )}

            {/* ── Other fields ── */}
            {primary.incomeType === "other" && (
              <>
                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your source of income?</h2>
                  <Input
                    label="Income Source"
                    required
                    value={primary.incomeSource}
                    onChange={(e) => updatePrimary("incomeSource", e.target.value)}
                  />
                  <ExpandableQuestion answer="We ask about your income source to understand your financial situation and match you with appropriate financing options that suit your circumstances." />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>What is your gross monthly income before taxes</h2>
                  <CurrencyInput
                    label="Monthly Income"
                    required
                    value={primary.monthlyIncome}
                    currency={primary.incomeCurrency}
                    onValueChange={(v) => updatePrimary("monthlyIncome", v)}
                    onCurrencyChange={(v) => updatePrimary("incomeCurrency", v)}
                  />
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <h2 style={sectionHeadingStyle}>{startDateHeading()}</h2>
                  <MonthYearPicker
                    label="Start Date"
                    required
                    value={primary.startDate}
                    onChange={(date) => updatePrimary("startDate", date)}
                    maxDate={new Date()}
                  />
                </div>

                {Array.from({ length: prevBlocksNeeded }, (_, i) => (
                  <PrevEmployerBlockUI
                    key={i}
                    index={i}
                    block={primary.previousEmployers[i] ?? emptyPrevBlock()}
                    maxEndDate={primary.startDate ?? new Date()}
                    onChange={updatePrevBlock}
                  />
                ))}
              </>
            )}

            {/* ── Extra income cards ── */}
            {extras.map((entry, idx) => (
              <ExtraIncomeCard
                key={entry.id}
                entry={entry}
                index={idx}
                onUpdate={updateExtra}
                onRemove={removeExtra}
              />
            ))}

            {/* ── Add another income ── */}
            <div className="flex items-center w-full">
              <button
                type="button"
                onClick={addExtraIncome}
                className="flex items-start gap-2 cursor-pointer bg-transparent border-none p-0"
              >
                {/* Plus icon */}
                <span className="mt-[2px] shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 2.5V13.5M2.5 8H13.5"
                      stroke="#2f2f39"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className="flex flex-col gap-[2px] items-start text-left">
                  <span
                    style={{
                      fontFamily: "var(--font-figtree), Figtree, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "#2f2f39",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Add another income if you have any
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-figtree), Figtree, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "#3c3c46",
                    }}
                  >
                    Please only include this income source if you have a 2 year history of receiving this income
                  </span>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center w-full">
          <button
            type="button"
            onClick={handleSaveNext}
            disabled={!canProceed}
            className="flex flex-1 items-center justify-center gap-2 h-10 px-5 rounded-[4px]"
            style={{
              background: canProceed ? "#4b0ea3" : "#ccb9e7",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                color: "#ffffff",
                whiteSpace: "nowrap",
              }}
            >
              Save &amp; Next
            </span>
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      {/* Help button */}
      <div className="fixed bottom-14 right-14 z-50">
        <button
          type="button"
          className="flex items-center justify-center rounded-full p-2 cursor-pointer"
          style={{
            width: 40,
            height: 40,
            background: "rgba(255,255,255,0.4)",
            border: "1px solid white",
            boxShadow: "0px 4px 32px 0px rgba(140,140,140,0.24)",
          }}
          aria-label="Help"
        >
          <QuestionMarkIcon />
        </button>
      </div>
    </div>
  );
}

export default function IncomePage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <IncomeForm />
    </Suspense>
  );
}
