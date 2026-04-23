"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import ComboSelect from "@/components/form/ComboSelect";
import SingleSelector from "@/components/form/SingleSelector";
import CurrencyInput from "@/components/form/CurrencyInput";
import MonthYearPicker from "@/components/form/MonthYearPicker";
import DatePicker from "@/components/form/DatePicker";
import ExpandableQuestion from "@/components/form/ExpandableQuestion";
import { ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";
import StepHint from "@/components/form/StepHint";

// ─── Static options (shared with other steps) ────────────────────────────────

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

const ID_TYPES = [
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "state_id", label: "State ID" },
  { value: "military_id", label: "Military ID" },
];

const SSN_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const HOUSING_TYPES = [
  { value: "renting", label: "Renting" },
  { value: "own", label: "Own" },
];

const OWN_TYPES = [
  { value: "with_mortgage", label: "Own with Mortgage" },
  { value: "outright", label: "Own Outright" },
];

type EmploymentType = "self_employed" | "w2" | "retired" | "other" | "";

// ─── Address types ────────────────────────────────────────────────────────────

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

// ─── Employer block types ─────────────────────────────────────────────────────

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

function emptyEmployer(): EmployerBlock {
  return { employerName: "", jobTitle: "", startDate: null, endDate: null };
}

// ─── Main state ───────────────────────────────────────────────────────────────

interface CoBorrowerState {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  // Housing
  housingType: string;
  ownType: string;
  monthlyPayment: string;
  paymentCurrency: string;
  // Address
  primaryAddress: AddressEntry;
  addressHistory: AddressEntry[];
  // Residency
  countryOfResidence: string;
  // Gov ID
  idType: string;
  idState: string;
  idNumber: string;
  // SSN
  hasSSN: string;
  ssn: string;
  // Employment
  employmentType: EmploymentType;
  businessName: string;
  employerName: string;
  jobTitle: string;
  grossMonthlyIncome: string;
  incomeCurrency: string;
  startDate: Date | null;
  retirementStartDate: Date | null;
  incomeSource: string;
  otherStartDate: Date | null;
  previousEmployers: EmployerBlock[];
  retiredPreviousEmployers: EmployerBlock[];
  // Relationship
  relationship: string;
}

interface StoredCoBorrowerState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  housingType: string;
  ownType: string;
  monthlyPayment: string;
  paymentCurrency: string;
  primaryAddress: StoredAddressEntry;
  addressHistory: StoredAddressEntry[];
  countryOfResidence: string;
  idType: string;
  idState: string;
  idNumber: string;
  hasSSN: string;
  ssn: string;
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
  relationship: string;
}

const STORAGE_KEY = "easyfund_co_borrower";

// ─── Serialization ────────────────────────────────────────────────────────────

function serializeAddress(a: AddressEntry): StoredAddressEntry {
  return { ...a, moveInDate: a.moveInDate ? a.moveInDate.toISOString() : null };
}
function deserializeAddress(a: StoredAddressEntry): AddressEntry {
  return { ...a, moveInDate: a.moveInDate ? new Date(a.moveInDate) : null };
}
function serializeEmployer(e: EmployerBlock): StoredEmployerBlock {
  return {
    ...e,
    startDate: e.startDate ? e.startDate.toISOString() : null,
    endDate: e.endDate ? e.endDate.toISOString() : null,
  };
}
function deserializeEmployer(e: StoredEmployerBlock): EmployerBlock {
  return {
    ...e,
    startDate: e.startDate ? new Date(e.startDate) : null,
    endDate: e.endDate ? new Date(e.endDate) : null,
  };
}

function emptyState(): CoBorrowerState {
  return {
    firstName: "", lastName: "", email: "", phone: "", dateOfBirth: null,
    housingType: "", ownType: "", monthlyPayment: "", paymentCurrency: "USD",
    primaryAddress: emptyAddress(), addressHistory: [],
    countryOfResidence: "",
    idType: "", idState: "", idNumber: "",
    hasSSN: "", ssn: "",
    employmentType: "", businessName: "", employerName: "", jobTitle: "",
    grossMonthlyIncome: "", incomeCurrency: "USD",
    startDate: null, retirementStartDate: null,
    incomeSource: "", otherStartDate: null,
    previousEmployers: [], retiredPreviousEmployers: [],
    relationship: "",
  };
}

function loadFromStorage(): CoBorrowerState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const s: StoredCoBorrowerState = JSON.parse(raw);
    return {
      ...s,
      dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth) : null,
      startDate: s.startDate ? new Date(s.startDate) : null,
      retirementStartDate: s.retirementStartDate ? new Date(s.retirementStartDate) : null,
      otherStartDate: s.otherStartDate ? new Date(s.otherStartDate) : null,
      primaryAddress: deserializeAddress(s.primaryAddress),
      addressHistory: (s.addressHistory ?? []).map(deserializeAddress),
      previousEmployers: (s.previousEmployers ?? []).map(deserializeEmployer),
      retiredPreviousEmployers: (s.retiredPreviousEmployers ?? []).map(deserializeEmployer),
    };
  } catch {
    return emptyState();
  }
}

function saveToStorage(state: CoBorrowerState) {
  const stored: StoredCoBorrowerState = {
    ...state,
    dateOfBirth: state.dateOfBirth ? state.dateOfBirth.toISOString() : null,
    startDate: state.startDate ? state.startDate.toISOString() : null,
    retirementStartDate: state.retirementStartDate ? state.retirementStartDate.toISOString() : null,
    otherStartDate: state.otherStartDate ? state.otherStartDate.toISOString() : null,
    primaryAddress: serializeAddress(state.primaryAddress),
    addressHistory: state.addressHistory.map(serializeAddress),
    previousEmployers: state.previousEmployers.map(serializeEmployer),
    retiredPreviousEmployers: state.retiredPreviousEmployers.map(serializeEmployer),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthsAgo(date: Date): number {
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}

function getAddressHistoryBlocks(primary: AddressEntry, history: AddressEntry[]): number {
  if (!primary.moveInDate) return 0;
  if (monthsAgo(primary.moveInDate) >= 24) return 0;
  for (let i = 0; i < 4; i++) {
    const h = history[i];
    if (!h?.moveInDate) return i + 1;
    if (monthsAgo(h.moveInDate) >= 24) return i + 1;
  }
  return 4;
}

function getEmploymentHistoryBlocks(
  startDate: Date | null,
  blocks: EmployerBlock[]
): number {
  if (!startDate) return 0;
  if (monthsAgo(startDate) >= 24) return 0;
  for (let i = 0; i < 4; i++) {
    const b = blocks[i];
    if (!b?.startDate) return i + 1;
    if (monthsAgo(b.startDate) >= 24) return i + 1;
  }
  return 4;
}

function needsPayment(housingType: string, ownType: string): boolean {
  return !(housingType === "own" && ownType === "outright");
}

// ─── Style constants ──────────────────────────────────────────────────────────

const mainTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500, fontSize: "36px", lineHeight: "52px",
  letterSpacing: "-0.25px", color: "#2f2f39",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400, fontSize: "24px", lineHeight: "36px",
  letterSpacing: "0px", color: "#2f2f39",
};

const blockHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400, fontSize: "20px", lineHeight: "30px",
  letterSpacing: "0px", color: "#2f2f39",
};

// ─── Employment type 2×2 grid ─────────────────────────────────────────────────

function EmploymentTypeGrid({
  value,
  onChange,
}: {
  value: EmploymentType;
  onChange: (v: EmploymentType) => void;
}) {
  const options: { value: EmploymentType; label: string }[] = [
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
            className="flex items-center justify-center px-4 rounded-[2px] border transition-colors cursor-pointer"
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

// ─── Main form ────────────────────────────────────────────────────────────────

function CoBorrowerForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "";
  const done = searchParams.get("done") ?? "";

  // If individual application, skip this step immediately
  useEffect(() => {
    if (type !== "co-borrower") {
      const existingDone = done ? done.split(",").filter(Boolean) : [];
      router.replace(`/apply/boat?type=${type}&done=${existingDone.join(",")}`);
    }
  }, [type, done, router]);

  const [state, setState] = useState<CoBorrowerState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  function update<K extends keyof CoBorrowerState>(field: K, value: CoBorrowerState[K]) {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  function updateAddress(
    which: "primaryAddress" | "addressHistory",
    index: number,
    field: keyof AddressEntry,
    value: string | Date | null
  ) {
    if (which === "primaryAddress") {
      setState((prev) => ({
        ...prev,
        primaryAddress: { ...prev.primaryAddress, [field]: value },
      }));
    } else {
      setState((prev) => {
        const next = [...prev.addressHistory];
        while (next.length <= index) next.push(emptyAddress());
        next[index] = { ...next[index], [field]: value };
        return { ...prev, addressHistory: next };
      });
    }
  }

  function updateEmployer(
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

  // ── Computed ──

  const addressHistoryBlocks = getAddressHistoryBlocks(
    state.primaryAddress,
    state.addressHistory
  );

  const empStartDate =
    state.employmentType === "retired" ? state.retirementStartDate : state.startDate;
  const empHistoryBlocks =
    state.employmentType === "retired"
      ? getEmploymentHistoryBlocks(state.retirementStartDate, state.retiredPreviousEmployers)
      : getEmploymentHistoryBlocks(empStartDate, state.previousEmployers);

  const paymentRequired = needsPayment(state.housingType, state.ownType);

  // ── Validation ──

  function isValid(): boolean {
    // Personal
    if (!state.firstName.trim() || !state.lastName.trim()) return false;
    if (!state.email.trim() || !state.phone.trim()) return false;
    if (!state.dateOfBirth) return false;
    // Housing
    if (!state.housingType) return false;
    if (state.housingType === "own" && !state.ownType) return false;
    if (paymentRequired && !state.monthlyPayment.trim()) return false;
    // Address
    const pa = state.primaryAddress;
    if (!pa.country || !pa.city.trim() || !pa.address.trim() || !pa.state || !pa.zip.trim()) return false;
    if (!pa.moveInDate) return false;
    for (let i = 0; i < addressHistoryBlocks; i++) {
      const h = state.addressHistory[i];
      if (!h?.country || !h?.city.trim() || !h?.address.trim() || !h?.state || !h?.zip.trim() || !h?.moveInDate) return false;
    }
    // Residency
    if (!state.countryOfResidence) return false;
    // Gov ID
    if (!state.idType || !state.idState || !state.idNumber.trim()) return false;
    // SSN
    if (!state.hasSSN) return false;
    if (state.hasSSN === "yes" && !state.ssn.trim()) return false;
    // Employment
    if (!state.employmentType) return false;
    if (!state.grossMonthlyIncome.trim()) return false;
    if (state.employmentType === "self_employed") {
      if (!state.businessName.trim() || !state.jobTitle.trim() || !state.startDate) return false;
    } else if (state.employmentType === "w2") {
      if (!state.employerName.trim() || !state.jobTitle.trim() || !state.startDate) return false;
    } else if (state.employmentType === "retired") {
      if (!state.retirementStartDate) return false;
    } else if (state.employmentType === "other") {
      if (!state.incomeSource.trim() || !state.otherStartDate) return false;
    }
    // Employment history
    const histList =
      state.employmentType === "retired" ? state.retiredPreviousEmployers : state.previousEmployers;
    for (let i = 0; i < empHistoryBlocks; i++) {
      const b = histList[i];
      if (!b?.employerName.trim() || !b?.startDate || !b?.endDate) return false;
    }
    // Relationship
    if (!state.relationship.trim()) return false;
    return true;
  }

  const canProceed = isValid();

  function handleSaveNext() {
    if (!canProceed) return;
    const existingDone = done ? done.split(",").filter(Boolean) : [];
    if (!existingDone.includes("co-borrower")) existingDone.push("co-borrower");
    router.push(`/apply/boat?type=${type}&done=${existingDone.join(",")}`);
  }

  // Address history headings
  const addressHistoryHeadings = [
    "Before that — still building our 2-year story",
    "And before that — getting closer to 2 years",
    "Further back — almost there",
    "One more — this should seal the 2 years",
  ];

  const empHistoryHeadings = [
    "Tell us about the Co-Borrower's previous employer (within the last 2 years)",
    "And the one before that",
    "Going further back",
    "One more previous employer",
  ];

  return (
    <div className="relative flex flex-col gap-12 items-start pb-14 pt-16 px-[276px] w-full">

      {/* Save & Exit */}
      <button
        type="button"
        className="absolute top-8 right-10 flex items-center justify-center h-10 px-5 rounded-[4px] border border-[#22222d] bg-transparent hover:bg-[rgba(34,34,45,0.04)] transition-colors cursor-pointer"
        style={{
          fontFamily: "var(--font-figtree), Figtree, sans-serif",
          fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#2f2f39",
        }}
      >
        Save &amp; Exit
      </button>

      <div className="flex flex-col gap-8 items-start w-[564px]">

        {/* Step hint */}
        <StepHint text="You're halfway there — great progress" />

        {/* ── Personal Details ── */}
        <div className="flex flex-col gap-5 w-full">
          <h1 style={mainTitleStyle}>Co-Borrower personal details</h1>

          <div className="flex gap-5 w-full">
            <Input label="First Name" required value={state.firstName} onChange={(e) => update("firstName", e.target.value)} />
            <Input label="Last Name" required value={state.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </div>
          <div className="flex gap-5 w-full">
            <Input label="Email" required type="email" value={state.email} onChange={(e) => update("email", e.target.value)} />
            <Input label="Phone Number" required type="tel" value={state.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>

        {/* ── Date of Birth ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>What is the Co-Borrower's date of birth?</h2>
          <DatePicker
            label="Date of Birth"
            required
            value={state.dateOfBirth}
            onChange={(date) => update("dateOfBirth", date)}
          />
        </div>

        {/* ── Housing ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>Does the Co-Borrower own or rent?</h2>
          <SingleSelector
            options={HOUSING_TYPES}
            value={state.housingType}
            onChange={(v) => update("housingType", v)}
          />
        </div>

        {state.housingType === "own" && (
          <div className="flex flex-col gap-5 w-full">
            <SingleSelector
              options={OWN_TYPES}
              value={state.ownType}
              onChange={(v) => update("ownType", v)}
            />
          </div>
        )}

        {state.housingType !== "" && paymentRequired && (
          <div className="flex flex-col gap-5 w-full">
            <h2 style={sectionHeadingStyle}>What is the monthly housing payment?</h2>
            <CurrencyInput
              label="Monthly Payment"
              required
              value={state.monthlyPayment}
              currency={state.paymentCurrency}
              onValueChange={(v) => update("monthlyPayment", v)}
              onCurrencyChange={(v) => update("paymentCurrency", v)}
            />
          </div>
        )}

        {/* ── Address ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>What is the Co-Borrower's address?</h2>

          <div className="flex gap-5 w-full">
            <ComboSelect label="Country" required options={COUNTRIES} value={state.primaryAddress.country}
              onChange={(v) => updateAddress("primaryAddress", 0, "country", v)} />
            <Input label="City" required value={state.primaryAddress.city}
              onChange={(e) => updateAddress("primaryAddress", 0, "city", e.target.value)} />
          </div>
          <div className="flex gap-5 w-full">
            <Input label="Address" required value={state.primaryAddress.address}
              onChange={(e) => updateAddress("primaryAddress", 0, "address", e.target.value)} />
            <ComboSelect label="State" required options={US_STATES} value={state.primaryAddress.state}
              onChange={(v) => updateAddress("primaryAddress", 0, "state", v)} />
          </div>
          <div className="flex gap-5 w-full">
            <Input label="ZIP Code" required value={state.primaryAddress.zip}
              onChange={(e) => updateAddress("primaryAddress", 0, "zip", e.target.value)} />
            <Input label="Apartment" value={state.primaryAddress.apartment}
              onChange={(e) => updateAddress("primaryAddress", 0, "apartment", e.target.value)} />
          </div>
          <ExpandableQuestion answer="We use this information to verify identity and comply with lending regulations." />
        </div>

        {/* ── Move-in date ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>When did the Co-Borrower start living here?</h2>
          <MonthYearPicker
            label="MM/YYYY"
            required
            value={state.primaryAddress.moveInDate}
            onChange={(date) => updateAddress("primaryAddress", 0, "moveInDate", date)}
            maxDate={new Date()}
          />
        </div>

        {/* ── Address history ── */}
        {Array.from({ length: addressHistoryBlocks }, (_, i) => {
          const entry = state.addressHistory[i] ?? emptyAddress();
          return (
            <div key={i} className="flex flex-col gap-5 w-full">
              <h2 style={blockHeadingStyle}>{addressHistoryHeadings[i] ?? "Previous address"}</h2>
              <div className="flex gap-5 w-full">
                <ComboSelect label="Country" required options={COUNTRIES} value={entry.country}
                  onChange={(v) => updateAddress("addressHistory", i, "country", v)} />
                <Input label="City" required value={entry.city}
                  onChange={(e) => updateAddress("addressHistory", i, "city", e.target.value)} />
              </div>
              <div className="flex gap-5 w-full">
                <Input label="Address" required value={entry.address}
                  onChange={(e) => updateAddress("addressHistory", i, "address", e.target.value)} />
                <ComboSelect label="State" required options={US_STATES} value={entry.state}
                  onChange={(v) => updateAddress("addressHistory", i, "state", v)} />
              </div>
              <div className="flex gap-5 w-full">
                <Input label="ZIP Code" required value={entry.zip}
                  onChange={(e) => updateAddress("addressHistory", i, "zip", e.target.value)} />
                <Input label="Apartment" value={entry.apartment}
                  onChange={(e) => updateAddress("addressHistory", i, "apartment", e.target.value)} />
              </div>
              <div className="flex flex-col gap-3 w-full">
                <h3 style={{ ...sectionHeadingStyle, fontSize: "18px", lineHeight: "28px" }}>
                  When did the Co-Borrower start living here?
                </h3>
                <MonthYearPicker
                  label="MM/YYYY"
                  required
                  value={entry.moveInDate}
                  onChange={(date) => updateAddress("addressHistory", i, "moveInDate", date)}
                  maxDate={state.primaryAddress.moveInDate ?? new Date()}
                />
              </div>
            </div>
          );
        })}

        {/* ── Country of Residence ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>What is the Co-Borrower's country of residence?</h2>
          <ComboSelect
            label="Country of Residence"
            required
            options={COUNTRIES}
            value={state.countryOfResidence}
            onChange={(v) => update("countryOfResidence", v)}
          />
          <ExpandableQuestion answer="We ask for country of residence to ensure we show financing options and terms that apply to the Co-Borrower's location and comply with local regulations." />
        </div>

        {/* ── Government ID ── */}
        <div className="flex flex-col gap-6 w-full">
          <h2 style={sectionHeadingStyle}>What is the Co-Borrower's government-issued ID number?</h2>
          <div className="flex flex-col gap-5 w-full">
            <div className="flex gap-5 w-full">
              <Select label="ID Type" required options={ID_TYPES} value={state.idType} onChange={(v) => update("idType", v)} />
              <ComboSelect label="State of Issue" required options={US_STATES} value={state.idState} onChange={(v) => update("idState", v)} />
            </div>
            <Input label="ID Number" required value={state.idNumber} onChange={(e) => update("idNumber", e.target.value)} />
          </div>
          <ExpandableQuestion answer="Lenders require government-issued ID to verify identity, prevent fraud, and comply with federal regulations." />
        </div>

        {/* ── SSN ── */}
        <div className="flex flex-col gap-6 w-full">
          <h2 style={sectionHeadingStyle}>Does the Co-Borrower have a Social Security Number?</h2>
          <SingleSelector options={SSN_OPTIONS} value={state.hasSSN} onChange={(v) => update("hasSSN", v)} />
        </div>

        {state.hasSSN === "yes" && (
          <div className="flex flex-col gap-6 w-full">
            <h2 style={sectionHeadingStyle}>What is the Co-Borrower's Social Security Number?</h2>
            <Input label="SSN Number" required type="password" value={state.ssn} onChange={(e) => update("ssn", e.target.value)} />
            <ExpandableQuestion answer="The SSN is used to verify identity, check credit history, and comply with federal lending regulations. This will only result in a soft credit pull." />
          </div>
        )}

        {/* ── Employment Type ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>What is the Co-Borrower's employment type?</h2>
          <EmploymentTypeGrid
            value={state.employmentType}
            onChange={(v) => update("employmentType", v)}
          />
        </div>

        {/* ── Self-Employed fields ── */}
        {state.employmentType === "self_employed" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's business name?</h2>
              <Input label="Business Name" required value={state.businessName} onChange={(e) => update("businessName", e.target.value)} />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's current position / title?</h2>
              <Input label="Job Title" required value={state.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's gross monthly income?</h2>
              <CurrencyInput label="Gross Monthly Income" required value={state.grossMonthlyIncome} currency={state.incomeCurrency}
                onValueChange={(v) => update("grossMonthlyIncome", v)} onCurrencyChange={(v) => update("incomeCurrency", v)} />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>How long has the Co-Borrower been self-employed?</h2>
              <MonthYearPicker label="Start Date" required value={state.startDate}
                onChange={(date) => update("startDate", date)} maxDate={new Date()} />
            </div>
            {Array.from({ length: empHistoryBlocks }, (_, i) => (
              <EmployerBlockUI key={i} index={i} block={state.previousEmployers[i] ?? emptyEmployer()}
                heading={empHistoryHeadings[i] ?? "Previous employer"}
                maxEndDate={state.startDate ?? new Date()}
                onChange={(idx, field, val) => updateEmployer("previousEmployers", idx, field, val)} />
            ))}
          </>
        )}

        {/* ── W-2 fields ── */}
        {state.employmentType === "w2" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's employer name?</h2>
              <Input label="Employer Name" required value={state.employerName} onChange={(e) => update("employerName", e.target.value)} />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's current position / title?</h2>
              <Input label="Job Title" required value={state.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's gross monthly income?</h2>
              <CurrencyInput label="Gross Monthly Income" required value={state.grossMonthlyIncome} currency={state.incomeCurrency}
                onValueChange={(v) => update("grossMonthlyIncome", v)} onCurrencyChange={(v) => update("incomeCurrency", v)} />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>When did the Co-Borrower start working here?</h2>
              <MonthYearPicker label="Start Date" required value={state.startDate}
                onChange={(date) => update("startDate", date)} maxDate={new Date()} />
            </div>
            {Array.from({ length: empHistoryBlocks }, (_, i) => (
              <EmployerBlockUI key={i} index={i} block={state.previousEmployers[i] ?? emptyEmployer()}
                heading={empHistoryHeadings[i] ?? "Previous employer"}
                maxEndDate={state.startDate ?? new Date()}
                onChange={(idx, field, val) => updateEmployer("previousEmployers", idx, field, val)} />
            ))}
          </>
        )}

        {/* ── Retired fields ── */}
        {state.employmentType === "retired" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's gross monthly income?</h2>
              <CurrencyInput label="Gross Monthly Income" required value={state.grossMonthlyIncome} currency={state.incomeCurrency}
                onValueChange={(v) => update("grossMonthlyIncome", v)} onCurrencyChange={(v) => update("incomeCurrency", v)} />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>When did the Co-Borrower retire?</h2>
              <MonthYearPicker label="Retirement Start Date" required value={state.retirementStartDate}
                onChange={(date) => update("retirementStartDate", date)} maxDate={new Date()} />
            </div>
            {Array.from({ length: empHistoryBlocks }, (_, i) => (
              <EmployerBlockUI key={i} index={i} block={state.retiredPreviousEmployers[i] ?? emptyEmployer()}
                heading={i === 0 ? "What was the Co-Borrower's previous job?" : empHistoryHeadings[i] ?? "Previous job"}
                showJobTitle
                maxEndDate={state.retirementStartDate ?? new Date()}
                onChange={(idx, field, val) => updateEmployer("retiredPreviousEmployers", idx, field, val)} />
            ))}
          </>
        )}

        {/* ── Other income ── */}
        {state.employmentType === "other" && (
          <>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's source of income?</h2>
              <Input label="Income Source" required value={state.incomeSource} onChange={(e) => update("incomeSource", e.target.value)} />
              <ExpandableQuestion answer="We ask about income source to understand the Co-Borrower's financial situation and match appropriate financing options." />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>What is the Co-Borrower's gross monthly income?</h2>
              <CurrencyInput label="Gross Monthly Income" required value={state.grossMonthlyIncome} currency={state.incomeCurrency}
                onValueChange={(v) => update("grossMonthlyIncome", v)} onCurrencyChange={(v) => update("incomeCurrency", v)} />
            </div>
            <div className="flex flex-col gap-5 w-full">
              <h2 style={sectionHeadingStyle}>When did this income start?</h2>
              <MonthYearPicker label="Start Date" required value={state.otherStartDate}
                onChange={(date) => update("otherStartDate", date)} maxDate={new Date()} />
            </div>
            {Array.from({ length: getEmploymentHistoryBlocks(state.otherStartDate, state.previousEmployers) }, (_, i) => (
              <EmployerBlockUI key={i} index={i} block={state.previousEmployers[i] ?? emptyEmployer()}
                heading={empHistoryHeadings[i] ?? "Previous employer"}
                maxEndDate={state.otherStartDate ?? new Date()}
                onChange={(idx, field, val) => updateEmployer("previousEmployers", idx, field, val)} />
            ))}
          </>
        )}

        {/* ── Relationship ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>What is the Co-Borrower's relationship to you?</h2>
          <Input
            label="Co-Borrower's relation to the Borrower"
            required
            value={state.relationship}
            onChange={(e) => update("relationship", e.target.value)}
          />
        </div>

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
              fontWeight: 500, fontSize: "16px", lineHeight: "24px",
              color: "#ffffff", whiteSpace: "nowrap",
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
            width: 40, height: 40,
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

// ─── Employer block sub-component ────────────────────────────────────────────

interface EmployerBlockUIProps {
  index: number;
  block: EmployerBlock;
  heading: string;
  showJobTitle?: boolean;
  maxEndDate?: Date;
  onChange: (index: number, field: keyof EmployerBlock, value: string | Date | null) => void;
}

function EmployerBlockUI({ index, block, heading, showJobTitle = false, maxEndDate, onChange }: EmployerBlockUIProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <h2 style={{
        fontFamily: "var(--font-poppins), Poppins, sans-serif",
        fontWeight: 400, fontSize: "20px", lineHeight: "30px",
        letterSpacing: "0px", color: "#2f2f39",
      }}>
        {heading}
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

export default function CoBorrowerPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <CoBorrowerForm />
    </Suspense>
  );
}
