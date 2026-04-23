"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import SingleSelector from "@/components/form/SingleSelector";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";
import StepHint from "@/components/form/StepHint";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VesselRecord {
  id: string;
  yearsOwned: string;
  vesselType: string;
  year: string;
  make: string;
  model: string;
}

interface OwnershipState {
  hasPriorOwnership: string;
  vessels: VesselRecord[];
}

const STORAGE_KEY = "easyfund_ownership";

const VESSEL_TYPE_OPTIONS = [
  { value: "motorboat", label: "Motorboat" },
  { value: "sailboat", label: "Sailboat" },
  { value: "yacht", label: "Yacht" },
  { value: "pontoon", label: "Pontoon" },
  { value: "catamaran", label: "Catamaran" },
  { value: "bowrider", label: "Bowrider" },
  { value: "deck_boat", label: "Deck Boat" },
  { value: "fishing_boat", label: "Fishing Boat" },
  { value: "center_console", label: "Center Console" },
  { value: "other", label: "Other" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) => {
  const y = String(currentYear - i);
  return { value: y, label: y };
});

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

function ordinalLabel(n: number): string {
  if (n === 1) return "1st vessel";
  if (n === 2) return "2nd vessel";
  if (n === 3) return "3rd vessel";
  return `${n}th vessel`;
}

function newVessel(): VesselRecord {
  return { id: String(Date.now() + Math.random()), yearsOwned: "", vesselType: "", year: "", make: "", model: "" };
}

function loadFromStorage(): OwnershipState {
  const empty: OwnershipState = { hasPriorOwnership: "", vessels: [newVessel()] };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      hasPriorOwnership: parsed.hasPriorOwnership ?? "",
      vessels: Array.isArray(parsed.vessels) && parsed.vessels.length > 0 ? parsed.vessels : [newVessel()],
    };
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

  function setPriorOwnership(v: string) {
    setState((prev) => ({ ...prev, hasPriorOwnership: v }));
  }

  function updateVessel(id: string, key: keyof VesselRecord, value: string) {
    setState((prev) => ({
      ...prev,
      vessels: prev.vessels.map((v) => (v.id === id ? { ...v, [key]: value } : v)),
    }));
  }

  function addVessel() {
    setState((prev) => ({ ...prev, vessels: [...prev.vessels, newVessel()] }));
  }

  function removeVessel(id: string) {
    setState((prev) => ({ ...prev, vessels: prev.vessels.filter((v) => v.id !== id) }));
  }

  function canProceed(): boolean {
    if (!state.hasPriorOwnership) return false;
    if (state.hasPriorOwnership === "yes") {
      return state.vessels.every(
        (v) => v.yearsOwned.trim() && v.vesselType && v.year && v.make && v.model.trim()
      );
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
        style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#2f2f39" }}
      >
        Save &amp; Exit
      </button>

      <div className="flex flex-col gap-8 items-start w-[564px]">

        {/* Title + hint */}
        <div className="flex flex-col gap-2 w-full">
          <StepHint text="You're almost there — just a bit more about your boating experience" />
          <h1 style={mainTitleStyle}>Do you have prior boat ownership experience?</h1>
        </div>

        {/* Yes / No */}
        <SingleSelector
          options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
          value={state.hasPriorOwnership}
          onChange={setPriorOwnership}
        />

        {/* Vessel records */}
        {state.hasPriorOwnership === "yes" && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>Tell us about your boat ownership experience</h2>

            <div className="flex flex-col gap-4 w-full">
              {state.vessels.map((vessel, idx) => (
                <div
                  key={vessel.id}
                  className="flex flex-col gap-4 w-full rounded-[8px] bg-white p-5"
                  style={{ boxShadow: "0px 4px 16px 0px rgba(34, 34, 45, 0.08)" }}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 500, fontSize: "14px", lineHeight: "20px", color: "#727279" }}
                    >
                      {ordinalLabel(idx + 1)}
                    </span>
                    {state.vessels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVessel(vessel.id)}
                        className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 hover:opacity-70 transition-opacity"
                        style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 400, fontSize: "14px", color: "#727279" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 4h12M5 4V2.667h6V4M6.5 7v5M9.5 7v5M3 4l.75 8.5c.05.56.52 1 1.08 1h6.34c.56 0 1.03-.44 1.08-1L13 4" stroke="#727279" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Row 1: Years | Vessel Type */}
                  <div className="flex gap-4 w-full">
                    <Input
                      label="Years of boat ownership"
                      required
                      value={vessel.yearsOwned}
                      onChange={(e) => updateVessel(vessel.id, "yearsOwned", e.target.value)}
                    />
                    <Select
                      label="Vessel Type"
                      required
                      options={VESSEL_TYPE_OPTIONS}
                      value={vessel.vesselType}
                      onChange={(v) => updateVessel(vessel.id, "vesselType", v)}
                    />
                  </div>

                  {/* Row 2: Year | Make */}
                  <div className="flex gap-4 w-full">
                    <Select
                      label="Year"
                      required
                      options={YEAR_OPTIONS}
                      value={vessel.year}
                      onChange={(v) => updateVessel(vessel.id, "year", v)}
                    />
                    <Select
                      label="Make"
                      required
                      options={MAKE_OPTIONS}
                      value={vessel.make}
                      onChange={(v) => updateVessel(vessel.id, "make", v)}
                    />
                  </div>

                  {/* Row 3: Model (half width) */}
                  <div style={{ width: "calc(50% - 8px)" }}>
                    <Input
                      label="Model"
                      required
                      value={vessel.model}
                      onChange={(e) => updateVessel(vessel.id, "model", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Boat */}
            <button
              type="button"
              onClick={addVessel}
              className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 hover:opacity-70 transition-opacity"
              style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 500, fontSize: "14px", color: "#4b0ea3" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="#4b0ea3" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add Another Boat
            </button>
          </div>
        )}

        {/* Save & Next */}
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
            <span style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#ffffff", whiteSpace: "nowrap" }}>
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
          style={{ width: 40, height: 40, background: "rgba(255,255,255,0.4)", border: "1px solid white", boxShadow: "0px 4px 32px 0px rgba(140,140,140,0.24)" }}
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
