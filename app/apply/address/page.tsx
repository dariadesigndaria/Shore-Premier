"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import ComboSelect from "@/components/form/ComboSelect";
import Checkbox from "@/components/form/Checkbox";
import ExpandableQuestion from "@/components/form/ExpandableQuestion";
import MonthYearPicker from "@/components/form/MonthYearPicker";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";
import StepHint from "@/components/form/StepHint";

const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "other", label: "Other" },
];

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "IL", label: "Illinois" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "WA", label: "Washington" },
  { value: "other", label: "Other" },
];

interface AddressEntry {
  country: string;
  city: string;
  address: string;
  state: string;
  zip: string;
  apartment: string;
  moveInDate: Date | null;
}

interface StoredAddressEntry {
  country: string;
  city: string;
  address: string;
  state: string;
  zip: string;
  apartment: string;
  moveInDate: string | null;
}

function emptyAddress(): AddressEntry {
  return { country: "", city: "", address: "", state: "", zip: "", apartment: "", moveInDate: null };
}

function serializeEntry(entry: AddressEntry): StoredAddressEntry {
  return { ...entry, moveInDate: entry.moveInDate ? entry.moveInDate.toISOString() : null };
}

function deserializeEntry(raw: StoredAddressEntry): AddressEntry {
  return { ...raw, moveInDate: raw.moveInDate ? new Date(raw.moveInDate) : null };
}

function monthsAgo(date: Date): number {
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}

function isEntryRequired(entry: AddressEntry): boolean {
  return (
    entry.country !== "" &&
    entry.city.trim() !== "" &&
    entry.address.trim() !== "" &&
    entry.state !== "" &&
    entry.zip.trim() !== ""
  );
}

const HISTORY_HEADINGS = [
  "Before that — still building our 2-year story",
  "And before that — getting closer to 2 years",
  "Further back — almost there",
  "One more — this should seal the 2 years",
];

const STORAGE_KEY = "easyfund_address";

interface StoredState {
  primary: StoredAddressEntry;
  history: StoredAddressEntry[];
  sameForCoBorrower: boolean;
}

function loadFromStorage(): { primary: AddressEntry; history: AddressEntry[]; sameForCoBorrower: boolean } {
  if (typeof window === "undefined") {
    return { primary: emptyAddress(), history: [], sameForCoBorrower: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { primary: emptyAddress(), history: [], sameForCoBorrower: false };
    const stored: StoredState = JSON.parse(raw);
    return {
      primary: deserializeEntry(stored.primary),
      history: (stored.history ?? []).map(deserializeEntry),
      sameForCoBorrower: stored.sameForCoBorrower ?? false,
    };
  } catch {
    return { primary: emptyAddress(), history: [], sameForCoBorrower: false };
  }
}

function saveToStorage(primary: AddressEntry, history: AddressEntry[], sameForCoBorrower: boolean) {
  const stored: StoredState = {
    primary: serializeEntry(primary),
    history: history.map(serializeEntry),
    sameForCoBorrower,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function AddressForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "";
  const done = searchParams.get("done") ?? "";
  const applicationType = type === "co-borrower" ? "co-borrower" : "individual";

  // Load from localStorage on mount
  const initial = loadFromStorage();
  const [primary, setPrimary] = useState<AddressEntry>(initial.primary);
  const [history, setHistory] = useState<AddressEntry[]>(initial.history);
  const [sameForCoBorrower, setSameForCoBorrower] = useState(initial.sameForCoBorrower);

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(primary, history, sameForCoBorrower);
  }, [primary, history, sameForCoBorrower]);

  function updatePrimary(field: keyof AddressEntry, value: string | Date | null) {
    setPrimary((p) => ({ ...p, [field]: value }));
  }

  function updateHistory(index: number, field: keyof AddressEntry, value: string | Date | null) {
    setHistory((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push(emptyAddress());
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  // How many history blocks to show:
  // - 0 if primary moveInDate covers >= 24 months
  // - Otherwise show blocks progressively until coverage reaches 24 months
  function getHistoryBlocksNeeded(): number {
    if (!primary.moveInDate) return 0;
    if (monthsAgo(primary.moveInDate) >= 24) return 0;

    for (let i = 0; i < 4; i++) {
      const h = history[i];
      if (!h?.moveInDate) return i + 1; // show this block, it's not filled yet
      if (monthsAgo(h.moveInDate) >= 24) return i + 1; // this block covers 2 years
      // still not enough — check if we need next block
    }
    return 4; // maximum 4 blocks
  }

  const historyBlocksNeeded = getHistoryBlocksNeeded();

  const primaryFilled = isEntryRequired(primary) && primary.moveInDate !== null;
  const historyFilled = Array.from({ length: historyBlocksNeeded }, (_, i) => history[i]).every(
    (h) => h && isEntryRequired(h) && h.moveInDate !== null
  );
  const canProceed = primaryFilled && historyFilled;

  function handleSaveNext() {
    if (!canProceed) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("address")) existingDone.push("address");
    router.push(`/apply/housing?type=${type}&done=${existingDone.join(",")}`);
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

  const blockHeadingStyle: React.CSSProperties = {
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "20px",
    lineHeight: "30px",
    letterSpacing: "0px",
    color: "#2f2f39",
  };

  const subHeadingStyle: React.CSSProperties = {
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "18px",
    lineHeight: "28px",
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

        {/* Step hint */}
        <StepHint text="This helps us verify your details and move your application forward" />

        {/* ── Section: Current Address ── */}
        <div className="flex flex-col gap-5 w-full">
          <h1 style={mainTitleStyle}>What is your Address?</h1>

          <div className="flex gap-5 w-full">
            <ComboSelect label="Country" required options={COUNTRIES} value={primary.country}
              onChange={(v) => updatePrimary("country", v)} />
            <Input label="City" required value={primary.city}
              onChange={(e) => updatePrimary("city", e.target.value)} />
          </div>

          <div className="flex gap-5 w-full">
            <Input label="Address" required value={primary.address}
              onChange={(e) => updatePrimary("address", e.target.value)} />
            <ComboSelect label="State" required options={US_STATES} value={primary.state}
              onChange={(v) => updatePrimary("state", v)} />
          </div>

          <div className="flex gap-5 w-full">
            <Input label="ZIP Code" required value={primary.zip}
              onChange={(e) => updatePrimary("zip", e.target.value)} />
            <Input label="Apartment" value={primary.apartment}
              onChange={(e) => updatePrimary("apartment", e.target.value)} />
          </div>

          {/* Co-borrower checkbox on primary block when no history needed */}
          {historyBlocksNeeded === 0 && applicationType === "co-borrower" && (
            <Checkbox
              label="Apply same address for Co-Borrower"
              checked={sameForCoBorrower}
              onChange={setSameForCoBorrower}
            />
          )}

          <ExpandableQuestion answer="We use this information to verify your identity and perform a soft credit check, which does not affect your credit score. It also ensures we can reach you with updates about your loan application and comply with lending regulations." />
        </div>

        {/* ── Section: Move-in date ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>When did you start living here?</h2>
          <MonthYearPicker
            label="MM/YYYY"
            required
            value={primary.moveInDate}
            onChange={(date) => updatePrimary("moveInDate", date)}
            maxDate={new Date()}
          />
        </div>

        {/* ── Progressive address history ── */}
        {Array.from({ length: historyBlocksNeeded }, (_, i) => {
          const histEntry = history[i] ?? emptyAddress();
          const isLast = i === historyBlocksNeeded - 1;

          return (
            <div key={i} className="flex flex-col gap-5 w-full">
              <h2 style={blockHeadingStyle}>
                {HISTORY_HEADINGS[i] ?? "Previous address"}
              </h2>

              <div className="flex gap-5 w-full">
                <ComboSelect label="Country" required options={COUNTRIES} value={histEntry.country}
                  onChange={(v) => updateHistory(i, "country", v)} />
                <Input label="City" required value={histEntry.city}
                  onChange={(e) => updateHistory(i, "city", e.target.value)} />
              </div>
              <div className="flex gap-5 w-full">
                <Input label="Address" required value={histEntry.address}
                  onChange={(e) => updateHistory(i, "address", e.target.value)} />
                <ComboSelect label="State" required options={US_STATES} value={histEntry.state}
                  onChange={(v) => updateHistory(i, "state", v)} />
              </div>
              <div className="flex gap-5 w-full">
                <Input label="ZIP Code" required value={histEntry.zip}
                  onChange={(e) => updateHistory(i, "zip", e.target.value)} />
                <Input label="Apartment" value={histEntry.apartment}
                  onChange={(e) => updateHistory(i, "apartment", e.target.value)} />
              </div>

              {/* Co-borrower checkbox on last block */}
              {isLast && applicationType === "co-borrower" && (
                <Checkbox
                  label="Apply same address for Co-Borrower"
                  checked={sameForCoBorrower}
                  onChange={setSameForCoBorrower}
                />
              )}

              <div className="flex flex-col gap-3 w-full">
                <h3 style={subHeadingStyle}>When did you start living here?</h3>
                <MonthYearPicker
                  label="MM/YYYY"
                  required
                  value={histEntry.moveInDate}
                  onChange={(date) => updateHistory(i, "moveInDate", date)}
                  maxDate={primary.moveInDate ?? new Date()}
                />
              </div>
            </div>
          );
        })}

        {/* ── Navigation: Save & Next ── */}
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

export default function AddressPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <AddressForm />
    </Suspense>
  );
}
