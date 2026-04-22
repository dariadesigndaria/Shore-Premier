"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import SingleSelector from "@/components/form/SingleSelector";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OwnershipState {
  hasPriorOwnership: string; // "yes" | "no" | ""
  // Prior ownership details (shown if yes)
  boatMake: string;
  boatModel: string;
  boatYear: string;
  yearsOwned: string;
  wasFinanced: string; // "yes" | "no" | ""
}

const STORAGE_KEY = "easyfund_ownership";

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

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) => {
  const y = String(currentYear - i);
  return { value: y, label: y };
});

function loadFromStorage(): OwnershipState {
  const empty: OwnershipState = {
    hasPriorOwnership: "",
    boatMake: "",
    boatModel: "",
    boatYear: "",
    yearsOwned: "",
    wasFinanced: "",
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function saveToStorage(state: OwnershipState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

// ─── Main form ────────────────────────────────────────────────────────────────

function OwnershipForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "individual";
  const done = searchParams.get("done") ?? "";

  const [state, setState] = useState<OwnershipState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  function update<K extends keyof OwnershipState>(key: K, value: OwnershipState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed(): boolean {
    if (!state.hasPriorOwnership) return false;
    if (state.hasPriorOwnership === "yes") {
      if (!state.boatMake || !state.boatModel.trim() || !state.boatYear) return false;
      if (!state.wasFinanced) return false;
    }
    return true;
  }

  function handleSaveNext() {
    if (!canProceed()) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("ownership")) existingDone.push("ownership");
    router.push(`/apply/declarations?type=${type}&done=${existingDone.join(",")}`);
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

        {/* Title */}
        <div className="flex flex-col gap-1 w-full">
          <h1 style={mainTitleStyle}>Ownership</h1>
        </div>

        {/* Prior boat ownership experience */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Do you have prior boat ownership experience?</h2>
          <SingleSelector
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={state.hasPriorOwnership}
            onChange={(v) => update("hasPriorOwnership", v)}
          />
        </div>

        {/* Prior ownership details (shown when Yes) */}
        {state.hasPriorOwnership === "yes" && (
          <>
            {/* Make | Model */}
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>Tell us about your previous vessel</h2>
              <div className="flex gap-5 w-full">
                <Select
                  label="Boat Make"
                  required
                  options={MAKE_OPTIONS}
                  value={state.boatMake}
                  onChange={(v) => update("boatMake", v)}
                />
                <Input
                  label="Boat Model"
                  required
                  value={state.boatModel}
                  onChange={(e) => update("boatModel", e.target.value)}
                />
              </div>

              {/* Year | Years Owned */}
              <div className="flex gap-5 w-full">
                <Select
                  label="Year"
                  required
                  options={YEAR_OPTIONS}
                  value={state.boatYear}
                  onChange={(v) => update("boatYear", v)}
                />
                <Input
                  label="How long did you own this vessel?"
                  value={state.yearsOwned}
                  onChange={(e) => update("yearsOwned", e.target.value)}
                />
              </div>
            </div>

            {/* Was it financed */}
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>Was this vessel financed?</h2>
              <SingleSelector
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={state.wasFinanced}
                onChange={(v) => update("wasFinanced", v)}
              />
            </div>
          </>
        )}

        {/* Navigation */}
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

export default function OwnershipPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <OwnershipForm />
    </Suspense>
  );
}
