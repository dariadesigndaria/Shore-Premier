"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import CurrencyInput from "@/components/form/CurrencyInput";
import MonthYearPicker from "@/components/form/MonthYearPicker";
import ExpandableQuestion from "@/components/form/ExpandableQuestion";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";
import StepHint from "@/components/form/StepHint";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmploymentType = "self_employed" | "w2" | "retired" | "other" | "";

interface EmployerBlock {
  employerName: string;
  jobTitle: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface StoredEmployerBlock {
  employerName: string;
  jobTitle: string;
  startDate: string | null;
  endDate: string | null;
}

interface EmploymentState {
  employmentType: EmploymentType;
  // Self-employed / W-2
  businessName: string;
  employerName: string;
  jobTitle: string;
  grossMonthlyIncome: string;
  incomeCurrency: string;
  startDate: Date | null;
  // Retired
  retirementStartDate: Date | null;
  // Other
  incomeSource: string;
  otherStartDate: Date | null;
  // Previous employer blocks (self-employed / W-2 / other)
  previousEmployers: EmployerBlock[];
  // Retired previous job
  retiredPreviousEmployers: EmployerBlock[];
}

interface StoredEmploymentState {
  employmentType: EmploymentType;
  businessName: string;
  employerName: string;
  jobTitle: string;
  grossMonthlyIncome: string;
  incomeCurrency: string;
  startDate: string | null;
  retirementStartDate: string | null;
  incomeSource: string;
  otherStartDate: string | null;
  previousEmployers: StoredEmployerBlock[];
  retiredPreviousEmployers: StoredEmployerBlock[];
}

const STORAGE_KEY = "easyfund_employment";

function emptyEmployer(): EmployerBlock {
  return { employerName: "", jobTitle: "", startDate: null, endDate: null };
}

function serializeBlock(b: EmployerBlock): StoredEmployerBlock {
  return {
    ...b,
    startDate: b.startDate ? b.startDate.toISOString() : null,
    endDate: b.endDate ? b.endDate.toISOString() : null,
  };
}

function deserializeBlock(b: StoredEmployerBlock): EmployerBlock {
  return {
    ...b,
    startDate: b.startDate ? new Date(b.startDate) : null,
    endDate: b.endDate ? new Date(b.endDate) : null,
  };
}

function emptyState(): EmploymentState {
  return {
    employmentType: "",
    businessName: "",
    employerName: "",
    jobTitle: "",
    grossMonthlyIncome: "",
    incomeCurrency: "USD",
    startDate: null,
    retirementStartDate: null,
    incomeSource: "",
    otherStartDate: null,
    previousEmployers: [],
    retiredPreviousEmployers: [],
  };
}

function loadFromStorage(): EmploymentState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const stored: StoredEmploymentState = JSON.parse(raw);
    return {
      ...stored,
      startDate: stored.startDate ? new Date(stored.startDate) : null,
      retirementStartDate: stored.retirementStartDate ? new Date(stored.retirementStartDate) : null,
      otherStartDate: stored.otherStartDate ? new Date(stored.otherStartDate) : null,
      previousEmployers: (stored.previousEmployers ?? []).map(deserializeBlock),
      retiredPreviousEmployers: (stored.retiredPreviousEmployers ?? []).map(deserializeBlock),
    };
  } catch {
    return emptyState();
  }
}

function saveToStorage(state: EmploymentState) {
  const stored: StoredEmploymentState = {
    ...state,
    startDate: state.startDate ? state.startDate.toISOString() : null,
    retirementStartDate: state.retirementStartDate ? state.retirementStartDate.toISOString() : null,
    otherStartDate: state.otherStartDate ? state.otherStartDate.toISOString() : null,
    previousEmployers: state.previousEmployers.map(serializeBlock),
    retiredPreviousEmployers: state.retiredPreviousEmployers.map(serializeBlock),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function monthsAgo(date: Date): number {
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}

// ─── Progressive previous employer blocks ────────────────────────────────────

function getPrevBlocksNeeded(startDate: Date | null, blocks: EmployerBlock[]): number {
  if (!startDate) return 0;
  if (monthsAgo(startDate) >= 24) return 0;

  for (let i = 0; i < 4; i++) {
    const b = blocks[i];
    if (!b?.startDate) return i + 1;
    if (monthsAgo(b.startDate) >= 24) return i + 1;
  }
  return 4;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const mainTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "36px",
  lineHeight: "52px",
  letterSpacing: "-0.25px",
  color: "#2f2f39",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400,
  fontSize: "24px",
  lineHeight: "36px",
  letterSpacing: "0px",
  color: "#2f2f39",
};

const prevSectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: "30px",
  letterSpacing: "0px",
  color: "#2f2f39",
};

// ─── Employment type selector ─────────────────────────────────────────────────

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "self_employed", label: "Self-Employed / Business Owner" },
  { value: "w2", label: "W-2 Employee" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
];

function EmploymentTypeGrid({
  value,
  onChange,
}: {
  value: EmploymentType;
  onChange: (v: EmploymentType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {EMPLOYMENT_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center justify-center px-4 rounded-[4px] border transition-colors cursor-pointer"
            style={{
              height: opt.value === "retired" || opt.value === "other" ? 72 : 48,
              background: selected ? "rgba(75,14,163,0.06)" : "#ffffff",
              borderColor: selected ? "#4b0ea3" : "#dcdcde",
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: selected ? 600 : 400,
              fontSize: "16px",
              lineHeight: "24px",
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

// ─── Previous employer block ──────────────────────────────────────────────────

interface PrevEmployerBlockProps {
  index: number;
  block: EmployerBlock;
  showJobTitle?: boolean;
  maxEndDate?: Date;
  onChange: (index: number, field: keyof EmployerBlock, value: string | Date | null) => void;
}

function PrevEmployerBlock({
  index,
  block,
  showJobTitle = true,
  maxEndDate,
  onChange,
}: PrevEmployerBlockProps) {
  const headings = [
    "Tell us about your previous employer",
    "And the one before that",
    "Going further back",
    "One more previous employer",
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      <h2 style={prevSectionHeadingStyle}>
        {headings[index] ?? "Previous employer"}
      </h2>

      <Input
        label="Employer Name"
        required
        value={block.employerName}
        onChange={(e) => onChange(index, "employerName", e.target.value)}
      />

      {showJobTitle && (
        <Input
          label="Job Title"
          required
          value={block.jobTitle}
          onChange={(e) => onChange(index, "jobTitle", e.target.value)}
        />
      )}

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

// ─── Main form ────────────────────────────────────────────────────────────────

function EmploymentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "";
  const done = searchParams.get("done") ?? "";

  const [state, setState] = useState<EmploymentState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  function update<K extends keyof EmploymentState>(field: K, value: EmploymentState[K]) {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  function updatePrevEmployer(
    listKey: "previousEmployers" | "retiredPreviousEmployers",
    index: number,
    field: keyof EmployerBlock,
    value: string | Date | null
  ) {
    setState((prev) => {
      const next = [...prev[listKey]];
      while (next.length <= index) next.push(emptyEmployer());
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [listKey]: next };
    });
  }

  // ── Validation ──

  function canProceed(): boolean {
    const { employmentType } = state;
    if (!employmentType) return false;

    if (employmentType === "self_employed") {
      if (!state.businessName.trim()) return false;
      if (!state.jobTitle.trim()) return false;
      if (!state.grossMonthlyIncome.trim()) return false;
      if (!state.startDate) return false;
      const blocks = getPrevBlocksNeeded(state.startDate, state.previousEmployers);
      for (let i = 0; i < blocks; i++) {
        const b = state.previousEmployers[i];
        if (!b?.employerName.trim() || !b?.startDate || !b?.endDate) return false;
      }
    } else if (employmentType === "w2") {
      if (!state.employerName.trim()) return false;
      if (!state.jobTitle.trim()) return false;
      if (!state.grossMonthlyIncome.trim()) return false;
      if (!state.startDate) return false;
      const blocks = getPrevBlocksNeeded(state.startDate, state.previousEmployers);
      for (let i = 0; i < blocks; i++) {
        const b = state.previousEmployers[i];
        if (!b?.employerName.trim() || !b?.startDate || !b?.endDate) return false;
      }
    } else if (employmentType === "retired") {
      if (!state.grossMonthlyIncome.trim()) return false;
      if (!state.retirementStartDate) return false;
      const blocks = getPrevBlocksNeeded(state.retirementStartDate, state.retiredPreviousEmployers);
      for (let i = 0; i < blocks; i++) {
        const b = state.retiredPreviousEmployers[i];
        if (!b?.employerName.trim() || !b?.jobTitle.trim() || !b?.startDate || !b?.endDate) return false;
      }
    } else if (employmentType === "other") {
      if (!state.incomeSource.trim()) return false;
      if (!state.grossMonthlyIncome.trim()) return false;
      if (!state.otherStartDate) return false;
      const blocks = getPrevBlocksNeeded(state.otherStartDate, state.previousEmployers);
      for (let i = 0; i < blocks; i++) {
        const b = state.previousEmployers[i];
        if (!b?.employerName.trim() || !b?.startDate || !b?.endDate) return false;
      }
    }

    return true;
  }

  function handleSaveNext() {
    if (!canProceed()) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("employment")) existingDone.push("employment");
    router.push(`/apply/income?type=${type}&done=${existingDone.join(",")}`);
  }

  const ready = canProceed();

  // ── Previous blocks counts ──
  const selfW2PrevBlocks = getPrevBlocksNeeded(state.startDate, state.previousEmployers);
  const retiredPrevBlocks = getPrevBlocksNeeded(state.retirementStartDate, state.retiredPreviousEmployers);
  const otherPrevBlocks = getPrevBlocksNeeded(state.otherStartDate, state.previousEmployers);

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

        {/* Step hint */}
        <StepHint text="This helps us match you with better rates and loan options" />

        {/* ── Employment Type ── */}
        <div className="flex flex-col gap-5 w-full">
          <h1 style={mainTitleStyle}>What is your employment status?</h1>
          <EmploymentTypeGrid
            value={state.employmentType}
            onChange={(v) => update("employmentType", v)}
          />
        </div>

        {/* ── Self-Employed / Business Owner ── */}
        {state.employmentType === "self_employed" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your business name?</h2>
              <Input
                label="Business Name"
                required
                value={state.businessName}
                onChange={(e) => update("businessName", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your current position / title?</h2>
              <Input
                label="Job Title"
                required
                value={state.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your gross monthly income?</h2>
              <CurrencyInput
                label="Gross Monthly Income"
                required
                value={state.grossMonthlyIncome}
                currency={state.incomeCurrency}
                onValueChange={(v) => update("grossMonthlyIncome", v)}
                onCurrencyChange={(v) => update("incomeCurrency", v)}
              />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>When did you start working here?</h2>
              <MonthYearPicker
                label="Start Date"
                required
                value={state.startDate}
                onChange={(date) => update("startDate", date)}
                maxDate={new Date()}
              />
            </div>

            {/* Previous employers */}
            {Array.from({ length: selfW2PrevBlocks }, (_, i) => (
              <PrevEmployerBlock
                key={i}
                index={i}
                block={state.previousEmployers[i] ?? emptyEmployer()}
                showJobTitle={false}
                maxEndDate={state.startDate ?? new Date()}
                onChange={(idx, field, val) => updatePrevEmployer("previousEmployers", idx, field, val)}
              />
            ))}
          </>
        )}

        {/* ── W-2 Employee ── */}
        {state.employmentType === "w2" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your employer name?</h2>
              <Input
                label="Employer Name"
                required
                value={state.employerName}
                onChange={(e) => update("employerName", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your current position / title?</h2>
              <Input
                label="Job Title"
                required
                value={state.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your gross monthly income?</h2>
              <CurrencyInput
                label="Gross Monthly Income"
                required
                value={state.grossMonthlyIncome}
                currency={state.incomeCurrency}
                onValueChange={(v) => update("grossMonthlyIncome", v)}
                onCurrencyChange={(v) => update("incomeCurrency", v)}
              />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>When did you start working here?</h2>
              <MonthYearPicker
                label="Start Date"
                required
                value={state.startDate}
                onChange={(date) => update("startDate", date)}
                maxDate={new Date()}
              />
            </div>

            {/* Previous employers */}
            {Array.from({ length: selfW2PrevBlocks }, (_, i) => (
              <PrevEmployerBlock
                key={i}
                index={i}
                block={state.previousEmployers[i] ?? emptyEmployer()}
                showJobTitle={false}
                maxEndDate={state.startDate ?? new Date()}
                onChange={(idx, field, val) => updatePrevEmployer("previousEmployers", idx, field, val)}
              />
            ))}
          </>
        )}

        {/* ── Retired ── */}
        {state.employmentType === "retired" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your gross monthly income?</h2>
              <CurrencyInput
                label="Gross Monthly Income"
                required
                value={state.grossMonthlyIncome}
                currency={state.incomeCurrency}
                onValueChange={(v) => update("grossMonthlyIncome", v)}
                onCurrencyChange={(v) => update("incomeCurrency", v)}
              />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>When did you retire?</h2>
              <MonthYearPicker
                label="Retirement Start Date"
                required
                value={state.retirementStartDate}
                onChange={(date) => update("retirementStartDate", date)}
                maxDate={new Date()}
              />
            </div>

            {/* Previous job blocks for retired */}
            {Array.from({ length: retiredPrevBlocks }, (_, i) => {
              const headings = [
                "What was your previous job?",
                "And the job before that?",
                "Going further back",
                "One more previous job",
              ];
              return (
                <div key={i} className="flex flex-col gap-5 w-full">
                  <h2 style={prevSectionHeadingStyle}>
                    {headings[i] ?? "Previous job"}
                  </h2>

                  <Input
                    label="Employer Name"
                    required
                    value={state.retiredPreviousEmployers[i]?.employerName ?? ""}
                    onChange={(e) =>
                      updatePrevEmployer("retiredPreviousEmployers", i, "employerName", e.target.value)
                    }
                  />

                  <Input
                    label="Job Title"
                    required
                    value={state.retiredPreviousEmployers[i]?.jobTitle ?? ""}
                    onChange={(e) =>
                      updatePrevEmployer("retiredPreviousEmployers", i, "jobTitle", e.target.value)
                    }
                  />

                  <div className="flex gap-5 w-full">
                    <MonthYearPicker
                      label="Start Date"
                      required
                      value={state.retiredPreviousEmployers[i]?.startDate ?? null}
                      onChange={(date) =>
                        updatePrevEmployer("retiredPreviousEmployers", i, "startDate", date)
                      }
                      maxDate={state.retirementStartDate ?? new Date()}
                    />
                    <MonthYearPicker
                      label="End Date"
                      required
                      value={state.retiredPreviousEmployers[i]?.endDate ?? null}
                      onChange={(date) =>
                        updatePrevEmployer("retiredPreviousEmployers", i, "endDate", date)
                      }
                      maxDate={state.retirementStartDate ?? new Date()}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── Other ── */}
        {state.employmentType === "other" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your source of income?</h2>
              <Input
                label="Income Source"
                required
                value={state.incomeSource}
                onChange={(e) => update("incomeSource", e.target.value)}
              />
              <ExpandableQuestion answer="We ask about your income source to understand your financial situation and match you with appropriate financing options that suit your circumstances." />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your gross monthly income?</h2>
              <CurrencyInput
                label="Gross Monthly Income"
                required
                value={state.grossMonthlyIncome}
                currency={state.incomeCurrency}
                onValueChange={(v) => update("grossMonthlyIncome", v)}
                onCurrencyChange={(v) => update("incomeCurrency", v)}
              />
            </div>

            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>When did this income start?</h2>
              <MonthYearPicker
                label="Start Date"
                required
                value={state.otherStartDate}
                onChange={(date) => update("otherStartDate", date)}
                maxDate={new Date()}
              />
            </div>

            {/* Previous employers */}
            {Array.from({ length: otherPrevBlocks }, (_, i) => (
              <PrevEmployerBlock
                key={i}
                index={i}
                block={state.previousEmployers[i] ?? emptyEmployer()}
                showJobTitle={false}
                maxEndDate={state.otherStartDate ?? new Date()}
                onChange={(idx, field, val) => updatePrevEmployer("previousEmployers", idx, field, val)}
              />
            ))}
          </>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center w-full">
          <button
            type="button"
            onClick={handleSaveNext}
            disabled={!ready}
            className="flex flex-1 items-center justify-center gap-2 h-10 px-5 rounded-[4px]"
            style={{
              background: ready ? "#4b0ea3" : "#ccb9e7",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: ready ? "pointer" : "not-allowed",
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

export default function EmploymentPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <EmploymentForm />
    </Suspense>
  );
}
