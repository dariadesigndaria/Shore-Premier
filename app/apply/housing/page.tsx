"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SingleSelector from "@/components/form/SingleSelector";
import Checkbox from "@/components/form/Checkbox";
import CurrencyInput from "@/components/form/CurrencyInput";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";
import StepHint from "@/components/form/StepHint";

const HOUSING_TYPES = [
  { value: "renting", label: "Renting" },
  { value: "own", label: "Own" },
];

const OWN_TYPES = [
  { value: "with_mortgage", label: "Own with Mortgage" },
  { value: "outright", label: "Own Outright" },
];

interface HousingState {
  housingType: string;
  ownType: string;
  monthlyPayment: string;
  currency: string;
  sameForCoBorrower: boolean;
}

const STORAGE_KEY = "easyfund_housing";

function loadFromStorage(): HousingState {
  const empty: HousingState = {
    housingType: "", ownType: "", monthlyPayment: "", currency: "USD", sameForCoBorrower: false,
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HousingState) : empty;
  } catch {
    return empty;
  }
}

// Monthly payment is required unless "own outright" is selected
function needsPayment(state: HousingState): boolean {
  return !(state.housingType === "own" && state.ownType === "outright");
}

function HousingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "";
  const done = searchParams.get("done") ?? "";
  const applicationType = type === "co-borrower" ? "co-borrower" : "individual";

  const [state, setState] = useState<HousingState>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function update<K extends keyof HousingState>(field: K, value: HousingState[K]) {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  // Own outright = no payment needed
  const paymentRequired = needsPayment(state);

  const canProceed =
    state.housingType !== "" &&
    (state.housingType !== "own" || state.ownType !== "") &&
    (!paymentRequired || state.monthlyPayment.trim() !== "");

  function handleSaveNext() {
    if (!canProceed) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("housing")) existingDone.push("housing");
    router.push(`/apply/employment?type=${type}&done=${existingDone.join(",")}`);
  }

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

        {/* ── Housing type ── */}
        <div className="flex flex-col gap-5 w-full">
          <div className="flex flex-col gap-2">
            <StepHint text="Clear answers here help avoid follow-up questions later." />
            <h1 style={mainTitleStyle}>What is your housing situation?</h1>
          </div>
          <SingleSelector
            options={HOUSING_TYPES}
            value={state.housingType}
            onChange={(v) => update("housingType", v)}
          />
        </div>

        {/* ── Own sub-type ── */}
        {state.housingType === "own" && (
          <div className="flex flex-col gap-5 w-full">
            <SingleSelector
              options={OWN_TYPES}
              value={state.ownType}
              onChange={(v) => update("ownType", v)}
            />
          </div>
        )}

        {/* ── Monthly payment (hidden for Own Outright) ── */}
        {state.housingType !== "" && paymentRequired && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>What is your monthly housing payment?</h2>
            <CurrencyInput
              label="Monthly Payment"
              required
              value={state.monthlyPayment}
              currency={state.currency}
              onValueChange={(v) => update("monthlyPayment", v)}
              onCurrencyChange={(v) => update("currency", v)}
            />
            {applicationType === "co-borrower" && (
              <Checkbox
                label="Apply same for Co-Borrower"
                checked={state.sameForCoBorrower}
                onChange={(v) => update("sameForCoBorrower", v)}
              />
            )}
          </div>
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
            <span style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24px",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}>
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

export default function HousingPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <HousingForm />
    </Suspense>
  );
}
