"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import CurrencyInput from "@/components/form/CurrencyInput";
import SingleSelector from "@/components/form/SingleSelector";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BoatState {
  loanType: string; // "purchasing" | "refinancing" | ""
  // Purchasing only
  purchasePrice: string;
  purchaseCurrency: string;
  downPayment: string;
  downPaymentCurrency: string;
  // Refinancing only
  loanAmount: string;
  loanAmountCurrency: string;
  // Vessel info
  make: string;
  model: string;
  year: string;
  engineMake: string;
  engineType: string;
  horsepowerPerEngine: string;
  numberOfEngines: number;
  // LLC
  llcTitled: string; // "yes" | "no" | ""
}

const STORAGE_KEY = "easyfund_boat";

function loadFromStorage(): BoatState {
  const empty: BoatState = {
    loanType: "",
    purchasePrice: "",
    purchaseCurrency: "USD",
    downPayment: "",
    downPaymentCurrency: "USD",
    loanAmount: "",
    loanAmountCurrency: "USD",
    make: "",
    model: "",
    year: "",
    engineMake: "",
    engineType: "",
    horsepowerPerEngine: "",
    numberOfEngines: 1,
    llcTitled: "",
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

function saveToStorage(state: BoatState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Options ─────────────────────────────────────────────────────────────────

const MAKE_OPTIONS = [
  { value: "azimut", label: "Azimut" },
  { value: "bayliner", label: "Bayliner" },
  { value: "bertram", label: "Bertram" },
  { value: "boston_whaler", label: "Boston Whaler" },
  { value: "brunswick", label: "Brunswick" },
  { value: "carver", label: "Carver" },
  { value: "chaparral", label: "Chaparral" },
  { value: "cobalt", label: "Cobalt" },
  { value: "donzi", label: "Donzi" },
  { value: "formula", label: "Formula" },
  { value: "fountaine_pajot", label: "Fountaine Pajot" },
  { value: "grady_white", label: "Grady-White" },
  { value: "hatteras", label: "Hatteras" },
  { value: "lund", label: "Lund" },
  { value: "malibu", label: "Malibu" },
  { value: "mastercraft", label: "MasterCraft" },
  { value: "meridian", label: "Meridian" },
  { value: "ocean", label: "Ocean Yachts" },
  { value: "pearson", label: "Pearson" },
  { value: "pursuit", label: "Pursuit" },
  { value: "regal", label: "Regal" },
  { value: "robalo", label: "Robalo" },
  { value: "sea_ray", label: "Sea Ray" },
  { value: "sportcraft", label: "Sportcraft" },
  { value: "tiara", label: "Tiara Yachts" },
  { value: "viking", label: "Viking" },
  { value: "wellcraft", label: "Wellcraft" },
  { value: "other", label: "Other" },
];

const ENGINE_MAKE_OPTIONS = [
  { value: "caterpillar", label: "Caterpillar" },
  { value: "cummins", label: "Cummins" },
  { value: "detroit_diesel", label: "Detroit Diesel" },
  { value: "honda", label: "Honda" },
  { value: "john_deere", label: "John Deere" },
  { value: "kohler", label: "Kohler" },
  { value: "man", label: "MAN" },
  { value: "mercury", label: "Mercury Marine" },
  { value: "nissan", label: "Nissan" },
  { value: "nanni", label: "Nanni" },
  { value: "parsons", label: "Parsons" },
  { value: "perkins", label: "Perkins" },
  { value: "suzuki", label: "Suzuki" },
  { value: "tohatsu", label: "Tohatsu" },
  { value: "volvo_penta", label: "Volvo Penta" },
  { value: "westerbeke", label: "Westerbeke" },
  { value: "yamaha", label: "Yamaha" },
  { value: "yanmar", label: "Yanmar" },
  { value: "other", label: "Other" },
];

const ENGINE_TYPE_OPTIONS = [
  { value: "inboard", label: "Inboard" },
  { value: "outboard", label: "Outboard" },
  { value: "sterndrive", label: "Sterndrive (I/O)" },
  { value: "jet", label: "Jet Drive" },
  { value: "pod_drive", label: "Pod Drive" },
  { value: "electric", label: "Electric" },
  { value: "diesel", label: "Diesel" },
  { value: "other", label: "Other" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) => {
  const y = String(currentYear - i);
  return { value: y, label: y };
});

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

// ─── Number of Engines Stepper ────────────────────────────────────────────────

function EnginesStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const filled = true; // always has a value

  return (
    <div
      className="flex items-center rounded-[2px] border border-[#dcdcde] bg-white hover:border-[#a6a6ab] transition-colors"
      style={{ width: 272, height: 48 }}
    >
      {/* Label on the left */}
      <div className="flex-1 flex flex-col justify-center pl-3 min-w-0">
        {/* Floated mini label */}
        <span
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 500,
            fontSize: "11px",
            lineHeight: "16px",
            color: "#a6a6ab",
            display: "block",
          }}
        >
          Number of Engines*
        </span>
        <span
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#2f2f39",
          }}
        >
          {value}
        </span>
      </div>

      {/* Minus button */}
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex items-center justify-center shrink-0 h-full cursor-pointer bg-transparent hover:bg-[#f9fafb] transition-colors"
        style={{
          width: 36,
          borderLeft: "1px solid #dcdcde",
          borderRight: "1px solid #dcdcde",
        }}
        aria-label="Decrease engines"
      >
        <span
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontSize: "18px",
            lineHeight: "1",
            color: value <= 1 ? "#a6a6ab" : "#2f2f39",
            userSelect: "none",
          }}
        >
          −
        </span>
      </button>

      {/* Plus button */}
      <button
        type="button"
        onClick={() => onChange(Math.min(10, value + 1))}
        className="flex items-center justify-center shrink-0 h-full cursor-pointer bg-transparent hover:bg-[#f9fafb] transition-colors"
        style={{ width: 36 }}
        aria-label="Increase engines"
      >
        <span
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontSize: "18px",
            lineHeight: "1",
            color: value >= 10 ? "#a6a6ab" : "#2f2f39",
            userSelect: "none",
          }}
        >
          +
        </span>
      </button>
    </div>
  );
}

// ─── LLC Tooltip ──────────────────────────────────────────────────────────────

const LLC_TOOLTIP_TEXT =
  "If the vessel will be titled in a Single Purpose LLC rather than your personal name. Lenders may require additional documentation, including organizational documents and guarantor information.";

function LLCTooltip() {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  }

  function hide() {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  }

  return (
    <div className="relative inline-flex items-center" onMouseEnter={show} onMouseLeave={hide}>
      {/* Circle trigger */}
      <div
        className="flex items-center justify-center cursor-default select-none"
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "rgba(34,34,34,0.1)",
        }}
        aria-label="More information"
      >
        <span
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 600,
            fontSize: "10px",
            lineHeight: "1",
            color: "#3c3c46",
          }}
        >
          ?
        </span>
      </div>

      {/* Tooltip bubble — right-anchored so it doesn't overlap the heading */}
      {visible && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            bottom: "calc(100% + 8px)",
            right: 0,
            width: 280,
            padding: "10px 12px",
            background: "#22222d",
            borderRadius: 8,
            boxShadow: "0px 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              lineHeight: "20px",
              color: "#ffffff",
              margin: 0,
            }}
          >
            {LLC_TOOLTIP_TEXT}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function BoatForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "individual";
  const done = searchParams.get("done") ?? "";

  const [state, setState] = useState<BoatState>(loadFromStorage);

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  function update<K extends keyof BoatState>(key: K, value: BoatState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  // ── Can proceed ──
  const isPurchasing = state.loanType === "purchasing";
  const isRefinancing = state.loanType === "refinancing";

  function canProceed(): boolean {
    if (!state.loanType) return false;

    if (isPurchasing) {
      if (!state.purchasePrice.trim() || !state.downPayment.trim()) return false;
    }
    if (isRefinancing) {
      if (!state.loanAmount.trim()) return false;
    }

    // Vessel fields
    if (
      !state.make ||
      !state.model.trim() ||
      !state.year ||
      !state.engineMake ||
      !state.engineType ||
      !state.horsepowerPerEngine.trim()
    )
      return false;

    // LLC
    if (!state.llcTitled) return false;

    return true;
  }

  function handleSaveNext() {
    if (!canProceed()) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("boat")) existingDone.push("boat");
    router.push(`/apply/summary?type=${type}&done=${existingDone.join(",")}`);
  }

  const llcQuestion = isPurchasing
    ? "Will the vessel be titled in an single purpose LLC?"
    : "Is the vessel titled in a LLC?";

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
          <h1 style={mainTitleStyle}>Boat Information</h1>
          <p style={subtitleStyle}>
            Tell us about the vessel and your financing needs
          </p>
        </div>

        {/* ── Purchasing / Refinancing selector ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Are you purchasing or refinancing?</h2>
          <SingleSelector
            options={[
              { value: "purchasing", label: "Purchasing" },
              { value: "refinancing", label: "Refinancing" },
            ]}
            value={state.loanType}
            onChange={(v) => update("loanType", v)}
          />
        </div>

        {/* ── Purchasing: Purchase Price + Down Payment ── */}
        {isPurchasing && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>What is the purchase price and down payment?</h2>
            <div className="flex gap-5 w-full">
              <CurrencyInput
                label="Vessel Purchase Price"
                required
                value={state.purchasePrice}
                currency={state.purchaseCurrency}
                onValueChange={(v) => update("purchasePrice", v)}
                onCurrencyChange={(v) => update("purchaseCurrency", v)}
              />
              <CurrencyInput
                label="Down Payment"
                required
                value={state.downPayment}
                currency={state.downPaymentCurrency}
                onValueChange={(v) => update("downPayment", v)}
                onCurrencyChange={(v) => update("downPaymentCurrency", v)}
              />
            </div>
          </div>
        )}

        {/* ── Refinancing: Loan Amount ── */}
        {isRefinancing && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>What is the loan amount?</h2>
            <CurrencyInput
              label="Loan Amount"
              required
              value={state.loanAmount}
              currency={state.loanAmountCurrency}
              onValueChange={(v) => update("loanAmount", v)}
              onCurrencyChange={(v) => update("loanAmountCurrency", v)}
            />
          </div>
        )}

        {/* ── Vessel Information ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Tell Us About Your Vessel</h2>

          {/* Make | Model */}
          <div className="flex gap-5 w-full">
            <Select
              label="Make"
              required
              options={MAKE_OPTIONS}
              value={state.make}
              onChange={(v) => update("make", v)}
            />
            <Input
              label="Model"
              required
              value={state.model}
              onChange={(e) => update("model", e.target.value)}
            />
          </div>

          {/* Year | Engine Make */}
          <div className="flex gap-5 w-full">
            <Select
              label="Year"
              required
              options={YEAR_OPTIONS}
              value={state.year}
              onChange={(v) => update("year", v)}
            />
            <Select
              label="Engine Make"
              required
              options={ENGINE_MAKE_OPTIONS}
              value={state.engineMake}
              onChange={(v) => update("engineMake", v)}
            />
          </div>

          {/* Engine Type | Horsepower per Engine */}
          <div className="flex gap-5 w-full">
            <Select
              label="Engine Type"
              required
              options={ENGINE_TYPE_OPTIONS}
              value={state.engineType}
              onChange={(v) => update("engineType", v)}
            />
            <Input
              label="Horsepower per Engine"
              required
              type="number"
              value={state.horsepowerPerEngine}
              onChange={(e) => update("horsepowerPerEngine", e.target.value)}
            />
          </div>

          {/* Number of Engines stepper (standalone row, left-aligned) */}
          <div className="flex items-center w-full">
            <EnginesStepper
              value={state.numberOfEngines}
              onChange={(v) => update("numberOfEngines", v)}
            />
          </div>
        </div>

        {/* ── LLC Question ── */}
        {state.loanType && (
          <div className="flex flex-col gap-5 w-full">
            {/* Tooltip sits immediately after the "?" */}
            <h2 style={sectionHeadingStyle}>
              {(() => {
                const words = llcQuestion.split(" ");
                const last = words[words.length - 1];
                const rest = words.slice(0, -1).join(" ");
                return (
                  <>
                    {rest}{" "}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
                      {last}
                      <LLCTooltip />
                    </span>
                  </>
                );
              })()}
            </h2>
            <SingleSelector
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={state.llcTitled}
              onChange={(v) => update("llcTitled", v)}
            />
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center w-full">
          <button
            type="button"
            onClick={handleSaveNext}
            disabled={!canProceed()}
            className="flex flex-1 items-center justify-center gap-2 h-10 px-5 rounded-[4px]"
            style={{
              background: canProceed() ? "#4b0ea3" : "#ccb9e7",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: canProceed() ? "pointer" : "not-allowed",
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

export default function BoatPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <BoatForm />
    </Suspense>
  );
}
