"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import SingleSelector from "@/components/form/SingleSelector";
import Checkbox from "@/components/form/Checkbox";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";

const HOUSING_TYPES = [
  { value: "renting", label: "Renting" },
  { value: "own", label: "Own" },
];

const OWN_TYPES = [
  { value: "with_mortgage", label: "Own with Mortgage" },
  { value: "outright", label: "Own Outright" },
];

function HousingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "";
  const done = searchParams.get("done") ?? "";
  const applicationType = type === "co-borrower" ? "co-borrower" : "individual";

  const [housingType, setHousingType] = useState("");
  const [ownType, setOwnType] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [sameForCoBorrower, setSameForCoBorrower] = useState(false);

  const canProceed = housingType !== "" && monthlyPayment.trim() !== "";

  function handleSaveNext() {
    if (!canProceed) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("housing")) {
      existingDone.push("housing");
    }
    const newDone = existingDone.join(",");
    router.push(`/apply/employment?type=${type}&done=${newDone}`);
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

      {/* Save & Exit button (top-right) */}
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

      {/* Form block */}
      <div className="flex flex-col gap-8 items-start w-[564px]">

        {/* ── Section: Housing Situation ── */}
        <div className="flex flex-col gap-5 w-full">
          <h1 style={mainTitleStyle}>What is your housing situation?</h1>
          <SingleSelector
            options={HOUSING_TYPES}
            value={housingType}
            onChange={setHousingType}
          />
        </div>

        {/* ── Own type sub-selector (conditional) ── */}
        {housingType === "own" && (
          <div className="flex flex-col gap-5 w-full">
            <SingleSelector
              options={OWN_TYPES}
              value={ownType}
              onChange={setOwnType}
            />
          </div>
        )}

        {/* ── Monthly payment (shown after housing type selected) ── */}
        {housingType !== "" && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>What is your monthly housing payment?</h2>
            <Input
              label="Monthly Payment"
              required
              type="number"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
            />
            {applicationType === "co-borrower" && (
              <Checkbox
                label="Apply same for Co-Borrower"
                checked={sameForCoBorrower}
                onChange={setSameForCoBorrower}
              />
            )}
          </div>
        )}

        {/* ── Navigation: Save & Next ── */}
        <div className="flex gap-0 items-center w-full">
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

      {/* Help button (bottom-right) */}
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
