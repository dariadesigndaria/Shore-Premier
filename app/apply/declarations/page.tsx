"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Select from "@/components/form/Select";
import ComboSelect from "@/components/form/ComboSelect";
import Input from "@/components/form/Input";
import SingleSelector from "@/components/form/SingleSelector";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";
import StepHint from "@/components/form/StepHint";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DeclarationsState {
  // PEP status
  isPEP: string; // "yes" | "no" | ""
  pepCountry: string;

  // Relationship to PEP
  isRelatedToPEP: string; // "yes" | "no" | ""
  pepRelationshipType: string; // "immediate_family" | "close_associate" | ""
  pepRelationshipDetail: string; // "What is your relationship?" or "Nature of your association"
  pepFirstName: string;
  pepLastName: string;
  pepCountryRelated: string;

  // Embassy
  isEmbassyEmployee: string; // "yes" | "no" | ""
  embassyHomeCountry: string;

  // Travel
  isFrequentTraveler: string; // "yes" | "no" | ""
  travelsOutsideUS: string; // "yes" | "no" | ""
  travelCountries: string[]; // multi-select
}

const STORAGE_KEY = "easyfund_declarations";

const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "mx", label: "Mexico" },
  { value: "br", label: "Brazil" },
  { value: "cn", label: "China" },
  { value: "jp", label: "Japan" },
  { value: "in", label: "India" },
  { value: "ru", label: "Russia" },
  { value: "it", label: "Italy" },
  { value: "es", label: "Spain" },
  { value: "nl", label: "Netherlands" },
  { value: "ch", label: "Switzerland" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "sg", label: "Singapore" },
  { value: "hk", label: "Hong Kong" },
  { value: "other", label: "Other" },
];

function loadFromStorage(): DeclarationsState {
  const empty: DeclarationsState = {
    isPEP: "",
    pepCountry: "",
    isRelatedToPEP: "",
    pepRelationshipType: "",
    pepRelationshipDetail: "",
    pepFirstName: "",
    pepLastName: "",
    pepCountryRelated: "",
    isEmbassyEmployee: "",
    embassyHomeCountry: "",
    isFrequentTraveler: "",
    travelsOutsideUS: "",
    travelCountries: [],
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

function saveToStorage(state: DeclarationsState) {
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

const subHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400,
  fontSize: "18px",
  lineHeight: "28px",
  color: "#3c3c46",
};

// ─── Multi-select countries ───────────────────────────────────────────────────

function MultiCountrySelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle(country: string) {
    if (value.includes(country)) {
      onChange(value.filter((c) => c !== country));
    } else {
      onChange([...value, country]);
    }
  }

  function removeTag(country: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((c) => c !== country));
  }

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <div
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[48px] flex flex-wrap items-center gap-2 rounded-[2px] border bg-white px-3 py-2 cursor-pointer transition-colors"
        style={{
          borderColor: open ? "#4b0ea3" : "#dcdcde",
          boxShadow: open ? "0 0 0 2px rgba(75,14,163,0.08)" : "none",
          paddingRight: 40,
          position: "relative",
        }}
      >
        {/* Floating label */}
        <span
          style={{
            position: "absolute",
            top: value.length > 0 ? -9 : "50%",
            left: 10,
            transform: value.length > 0 ? "none" : "translateY(-50%)",
            fontSize: value.length > 0 ? "11px" : "14px",
            color: "#a6a6ab",
            background: "white",
            padding: value.length > 0 ? "0 3px" : "0",
            pointerEvents: "none",
            transition: "all 0.15s",
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
          }}
        >
          Countries*
        </span>

        {/* Tags */}
        {value.map((v) => {
          const label = COUNTRIES.find((c) => c.value === v)?.label ?? v;
          return (
            <div
              key={v}
              className="flex items-center gap-1 rounded-[4px] px-2 py-[3px]"
              style={{ background: "#f0f0f2" }}
            >
              <span style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontSize: "13px", color: "#2f2f39" }}>
                {label}
              </span>
              <button
                type="button"
                onClick={(e) => removeTag(v, e)}
                className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 hover:opacity-60"
                aria-label={`Remove ${label}`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2L10 10M10 2L2 10" stroke="#727279" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}

        {value.length === 0 && (
          <span style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontSize: "14px", color: "transparent" }}>
            &nbsp;
          </span>
        )}

        {/* Chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="#727279" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Dropdown list */}
      {open && (
        <div
          className="absolute z-50 w-full bg-white border border-[#dcdcde] rounded-[4px] mt-1 max-h-60 overflow-y-auto"
          style={{ boxShadow: "0px 4px 16px rgba(0,0,0,0.1)" }}
        >
          {COUNTRIES.map((country) => {
            const selected = value.includes(country.value);
            return (
              <label
                key={country.value}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f9f5ff] transition-colors"
              >
                <div
                  className="flex items-center justify-center rounded-[3px] shrink-0"
                  style={{
                    width: 16,
                    height: 16,
                    border: selected ? "1.5px solid #4b0ea3" : "1.5px solid #dcdcde",
                    background: selected ? "#4b0ea3" : "#ffffff",
                  }}
                >
                  {selected && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={selected} onChange={() => toggle(country.value)} className="sr-only" />
                <span style={{ fontFamily: "var(--font-figtree), Figtree, sans-serif", fontSize: "14px", color: "#2f2f39" }}>
                  {country.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function DeclarationsForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "individual";
  const done = searchParams.get("done") ?? "";

  const [state, setState] = useState<DeclarationsState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  function update<K extends keyof DeclarationsState>(key: K, value: DeclarationsState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed(): boolean {
    if (!state.isPEP) return false;
    if (state.isPEP === "yes" && !state.pepCountry) return false;

    if (!state.isRelatedToPEP) return false;
    if (state.isRelatedToPEP === "yes") {
      if (!state.pepRelationshipType) return false;
      if (!state.pepFirstName.trim() || !state.pepLastName.trim()) return false;
      if (!state.pepCountryRelated) return false;
    }

    if (!state.isEmbassyEmployee) return false;
    if (state.isEmbassyEmployee === "yes" && !state.embassyHomeCountry) return false;

    if (!state.isFrequentTraveler) return false;
    if (!state.travelsOutsideUS) return false;

    return true;
  }

  function handleSaveNext() {
    if (!canProceed()) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("declarations")) existingDone.push("declarations");
    router.push(`/apply/summary?type=${type}&done=${existingDone.join(",")}`);
  }

  const pepDetailLabel =
    state.pepRelationshipType === "close_associate"
      ? "Nature of your association"
      : "What is your relationship?";

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
        <div className="flex flex-col gap-2 w-full">
          <StepHint text="You're at the final stage of your insurance application." />
          <h1 style={mainTitleStyle}>Declarations</h1>
        </div>

        {/* ── PEP Status ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Are you currently, or have you ever been, a politically exposed person (PEP)?</h2>
          <SingleSelector
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={state.isPEP}
            onChange={(v) => update("isPEP", v)}
          />
        </div>

        {state.isPEP === "yes" && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>In what country are/were you a PEP?</h2>
            <ComboSelect
              label="Country"
              required
              options={COUNTRIES}
              value={state.pepCountry}
              onChange={(v) => update("pepCountry", v)}
            />
          </div>
        )}

        {/* ── Related to PEP ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Are you an immediate family member or close associate of someone who is/was a PEP?</h2>
          <SingleSelector
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={state.isRelatedToPEP}
            onChange={(v) => {
              update("isRelatedToPEP", v);
              if (v === "no") {
                setState((prev) => ({
                  ...prev,
                  isRelatedToPEP: v,
                  pepRelationshipType: "",
                  pepRelationshipDetail: "",
                  pepFirstName: "",
                  pepLastName: "",
                  pepCountryRelated: "",
                }));
              } else {
                update("isRelatedToPEP", v);
              }
            }}
          />
        </div>

        {state.isRelatedToPEP === "yes" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is your relationship?</h2>
              <SingleSelector
                options={[
                  { value: "immediate_family", label: "Immediate family member" },
                  { value: "close_associate", label: "Close associate" },
                ]}
                value={state.pepRelationshipType}
                onChange={(v) => update("pepRelationshipType", v)}
              />
            </div>

            {state.pepRelationshipType && (
              <div className="flex flex-col gap-5 w-full">
                <h2 style={subHeadingStyle}>PEP Details</h2>

                <div className="flex flex-col gap-4 w-full">
                  <Input
                    label={pepDetailLabel}
                    required
                    value={state.pepRelationshipDetail}
                    onChange={(e) => update("pepRelationshipDetail", e.target.value)}
                  />
                  <div className="flex gap-5 w-full">
                    <Input
                      label="PEP First Name"
                      required
                      value={state.pepFirstName}
                      onChange={(e) => update("pepFirstName", e.target.value)}
                    />
                    <Input
                      label="PEP Last Name"
                      required
                      value={state.pepLastName}
                      onChange={(e) => update("pepLastName", e.target.value)}
                    />
                  </div>
                  <ComboSelect
                    label="Country where person is/was a PEP"
                    required
                    options={COUNTRIES}
                    value={state.pepCountryRelated}
                    onChange={(v) => update("pepCountryRelated", v)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Embassy ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Are you an employee of an embassy, foreign consulate, or foreign mission?</h2>
          <SingleSelector
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={state.isEmbassyEmployee}
            onChange={(v) => update("isEmbassyEmployee", v)}
          />
        </div>

        {state.isEmbassyEmployee === "yes" && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>What is the home country of the embassy, consulate, or mission?</h2>
            <ComboSelect
              label="Country"
              required
              options={COUNTRIES}
              value={state.embassyHomeCountry}
              onChange={(v) => update("embassyHomeCountry", v)}
            />
          </div>
        )}

        {/* ── Frequent Traveler ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Are you a frequent traveler?</h2>
          <SingleSelector
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={state.isFrequentTraveler}
            onChange={(v) => update("isFrequentTraveler", v)}
          />
        </div>

        {/* ── Travel outside US ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Do you travel outside the US?</h2>
          <SingleSelector
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={state.travelsOutsideUS}
            onChange={(v) => update("travelsOutsideUS", v)}
          />
        </div>

        {state.travelsOutsideUS === "yes" && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>Which countries do you travel to?</h2>
            <MultiCountrySelect
              value={state.travelCountries}
              onChange={(v) => update("travelCountries", v)}
            />
          </div>
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

export default function DeclarationsPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <DeclarationsForm />
    </Suspense>
  );
}
