"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import Checkbox from "@/components/form/Checkbox";
import ExpandableQuestion from "@/components/form/ExpandableQuestion";
import { ArrowRightIcon, QuestionMarkIcon, CalendarIcon } from "@/components/icons";

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
  moveInDate: string;
}

function emptyAddress(): AddressEntry {
  return { country: "", city: "", address: "", state: "", zip: "", apartment: "", moveInDate: "" };
}

function monthsAgo(mmyy: string): number {
  const parts = mmyy.split("/");
  if (parts.length !== 2) return 0;
  const mm = parseInt(parts[0], 10);
  const yy = parseInt(parts[1], 10);
  if (isNaN(mm) || isNaN(yy)) return 0;
  const year = yy + 2000;
  const month = mm - 1;
  const date = new Date(year, month, 1);
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}

function isValidMMYY(mmyy: string): boolean {
  const parts = mmyy.split("/");
  if (parts.length !== 2) return false;
  const mm = parseInt(parts[0], 10);
  const yy = parseInt(parts[1], 10);
  if (isNaN(mm) || isNaN(yy)) return false;
  if (mm < 1 || mm > 12) return false;
  const year = yy + 2000;
  const now = new Date();
  const date = new Date(year, mm - 1, 1);
  return date <= now;
}

const HISTORY_HEADINGS = [
  "Before that — still building our 2-year story",
  "And before that — getting closer to 2 years",
  "Further back — almost there",
  "One more — this should seal the 2 years",
];

function AddressForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "";
  const done = searchParams.get("done") ?? "";
  const applicationType = type === "co-borrower" ? "co-borrower" : "individual";

  const [primary, setPrimary] = useState<AddressEntry>(emptyAddress());
  const [sameForCoBorrower, setSameForCoBorrower] = useState(false);
  const [history, setHistory] = useState<AddressEntry[]>([]);

  function handleHistoryUpdate(index: number, field: keyof AddressEntry, value: string) {
    setHistory((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push(emptyAddress());
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  // Calculate how many history blocks to show
  function getHistoryBlocksNeeded(): number {
    if (!isValidMMYY(primary.moveInDate)) return 0;
    const primaryMonths = monthsAgo(primary.moveInDate);
    if (primaryMonths >= 24) return 0;

    let totalCovered = primaryMonths;
    let blocks = 0;

    for (let i = 0; i < 4; i++) {
      if (totalCovered >= 24) break;
      blocks = i + 1;
      if (i < history.length && isValidMMYY(history[i].moveInDate)) {
        totalCovered = monthsAgo(history[i].moveInDate);
        if (totalCovered >= 24) break;
      } else {
        break;
      }
    }

    return Math.min(blocks, 4);
  }

  const historyBlocksNeeded = getHistoryBlocksNeeded();

  // Build display history (pad with empty entries as needed)
  const displayedHistory: AddressEntry[] = Array.from(
    { length: historyBlocksNeeded },
    (_, i) => history[i] ?? emptyAddress()
  );

  const primaryRequired =
    primary.country !== "" &&
    primary.city.trim() !== "" &&
    primary.address.trim() !== "" &&
    primary.state !== "" &&
    primary.zip.trim() !== "" &&
    isValidMMYY(primary.moveInDate);

  const historyValid = displayedHistory.every((h) =>
    h.country !== "" &&
    h.city.trim() !== "" &&
    h.address.trim() !== "" &&
    h.state !== "" &&
    h.zip.trim() !== "" &&
    isValidMMYY(h.moveInDate)
  );

  const canProceed = primaryRequired && (historyBlocksNeeded === 0 || historyValid);

  function handleSaveNext() {
    if (!canProceed) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("address")) {
      existingDone.push("address");
    }
    const newDone = existingDone.join(",");
    router.push(`/apply/housing?type=${type}&done=${newDone}`);
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

        {/* ── Section: Address ── */}
        <div className="flex flex-col gap-5 w-full">
          <h1 style={mainTitleStyle}>What is your Address?</h1>

          {/* Row 1: Country + City */}
          <div className="flex gap-5 w-full">
            <Select label="Country" required options={COUNTRIES} value={primary.country}
              onChange={(v) => setPrimary((p) => ({ ...p, country: v }))} />
            <Input label="City" required value={primary.city}
              onChange={(e) => setPrimary((p) => ({ ...p, city: e.target.value }))} />
          </div>

          {/* Row 2: Address + State */}
          <div className="flex gap-5 w-full">
            <Input label="Address" required value={primary.address}
              onChange={(e) => setPrimary((p) => ({ ...p, address: e.target.value }))} />
            <Select label="State" required options={US_STATES} value={primary.state}
              onChange={(v) => setPrimary((p) => ({ ...p, state: v }))} />
          </div>

          {/* Row 3: ZIP + Apartment */}
          <div className="flex gap-5 w-full">
            <Input label="ZIP Code" required value={primary.zip}
              onChange={(e) => setPrimary((p) => ({ ...p, zip: e.target.value }))} />
            <Input label="Apartment" value={primary.apartment}
              onChange={(e) => setPrimary((p) => ({ ...p, apartment: e.target.value }))} />
          </div>

          {/* Co-borrower checkbox on primary block if no history needed */}
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
          <Input
            label="MM/YY"
            required
            value={primary.moveInDate}
            onChange={(e) => setPrimary((p) => ({ ...p, moveInDate: e.target.value }))}
            rightIcon={<CalendarIcon />}
          />
        </div>

        {/* ── Progressive address history ── */}
        {displayedHistory.map((histEntry, i) => {
          const isLast = i === historyBlocksNeeded - 1;
          return (
            <div key={i} className="flex flex-col gap-5 w-full">
              <h2 style={blockHeadingStyle}>
                {HISTORY_HEADINGS[i] ?? "Previous address"}
              </h2>

              <div className="flex gap-5 w-full">
                <Select label="Country" required options={COUNTRIES} value={histEntry.country}
                  onChange={(v) => handleHistoryUpdate(i, "country", v)} />
                <Input label="City" required value={histEntry.city}
                  onChange={(e) => handleHistoryUpdate(i, "city", e.target.value)} />
              </div>
              <div className="flex gap-5 w-full">
                <Input label="Address" required value={histEntry.address}
                  onChange={(e) => handleHistoryUpdate(i, "address", e.target.value)} />
                <Select label="State" required options={US_STATES} value={histEntry.state}
                  onChange={(v) => handleHistoryUpdate(i, "state", v)} />
              </div>
              <div className="flex gap-5 w-full">
                <Input label="ZIP Code" required value={histEntry.zip}
                  onChange={(e) => handleHistoryUpdate(i, "zip", e.target.value)} />
                <Input label="Apartment" value={histEntry.apartment}
                  onChange={(e) => handleHistoryUpdate(i, "apartment", e.target.value)} />
              </div>

              {isLast && applicationType === "co-borrower" && (
                <Checkbox
                  label="Apply same address for Co-Borrower"
                  checked={sameForCoBorrower}
                  onChange={setSameForCoBorrower}
                />
              )}

              <div className="flex flex-col gap-3 w-full">
                <h3 style={{
                  fontFamily: "var(--font-poppins), Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: "28px",
                  color: "#2f2f39",
                }}>
                  When did you start living here?
                </h3>
                <Input
                  label="MM/YY"
                  required
                  value={histEntry.moveInDate}
                  onChange={(e) => handleHistoryUpdate(i, "moveInDate", e.target.value)}
                  rightIcon={<CalendarIcon />}
                />
              </div>
            </div>
          );
        })}

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

export default function AddressPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <AddressForm />
    </Suspense>
  );
}
