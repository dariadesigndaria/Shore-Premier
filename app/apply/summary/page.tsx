"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PenIcon, ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";

// ─── Shared types (mirrors each step's storage shape) ────────────────────────

interface AddressEntry {
  country: string;
  city: string;
  address: string;
  state: string;
  zip: string;
  apartment: string;
  moveInDate: string | null;
}

interface EmployerBlock {
  employerName: string;
  jobTitle: string;
  startDate: string | null;
  endDate: string | null;
}

// About You
interface AboutYouStored {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  country: string;
  idType: string;
  idState: string;
  idNumber: string;
  hasSSN: string;
  ssn: string;
}

// Address
interface AddressStored {
  primary: AddressEntry;
  history: AddressEntry[];
  sameForCoBorrower: boolean;
}

// Housing
interface HousingStored {
  housingType: string;
  ownType: string;
  monthlyPayment: string;
  currency: string;
  sameForCoBorrower: boolean;
}

// Employment
interface EmploymentStored {
  employmentType: string;
  businessName: string;
  employerName: string;
  jobTitle: string;
  grossMonthlyIncome: string;
  incomeCurrency: string;
  startDate: string | null;
  retirementStartDate: string | null;
  incomeSource: string;
  otherStartDate: string | null;
  previousEmployers: EmployerBlock[];
  retiredPreviousEmployers: EmployerBlock[];
}

// Income
interface PrevIncomeBlock {
  employerName: string;
  startDate: string | null;
  endDate: string | null;
}

interface PrimaryIncomeStored {
  incomeType: string;
  businessName: string;
  employerName: string;
  jobTitle: string;
  monthlyIncome: string;
  incomeCurrency: string;
  startDate: string | null;
  retirementStartDate: string | null;
  incomeSource: string;
  previousEmployers: PrevIncomeBlock[];
}

interface ExtraIncomeStored {
  id: string;
  employmentType: string;
  employerName: string;
  jobTitle: string;
  monthlyIncome: string;
  incomeCurrency: string;
  startDate: string | null;
}

interface IncomeStored {
  hasAdditionalIncome: string;
  primary: PrimaryIncomeStored;
  extras: ExtraIncomeStored[];
}

// Co-Borrower
interface CoBorrowerStored {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  housingType: string;
  ownType: string;
  monthlyPayment: string;
  paymentCurrency: string;
  primaryAddress: AddressEntry;
  addressHistory: AddressEntry[];
  countryOfResidence: string;
  idType: string;
  idState: string;
  idNumber: string;
  hasSSN: string;
  ssn: string;
  employmentType: string;
  businessName: string;
  employerName: string;
  jobTitle: string;
  grossMonthlyIncome: string;
  incomeCurrency: string;
  startDate: string | null;
  retirementStartDate: string | null;
  incomeSource: string;
  otherStartDate: string | null;
  previousEmployers: EmployerBlock[];
  retiredPreviousEmployers: EmployerBlock[];
  relationship: string;
}

// Boat
interface BoatStored {
  loanType: string;
  purchasePrice: string;
  purchaseCurrency: string;
  downPayment: string;
  downPaymentCurrency: string;
  loanAmount: string;
  loanAmountCurrency: string;
  make: string;
  model: string;
  year: string;
  engineMake: string;
  engineType: string;
  horsepowerPerEngine: string;
  numberOfEngines: number;
  llcTitled: string;
}

// ─── Storage loaders ─────────────────────────────────────────────────────────

function load<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// ─── Display label maps ───────────────────────────────────────────────────────

const EMPLOYMENT_LABELS: Record<string, string> = {
  self_employed: "Self-Employed or Business Owner",
  w2: "W-2 Employee",
  retired: "Retired",
  other: "Other",
};

const HOUSING_LABELS: Record<string, string> = {
  renting: "Renting",
  own: "Owning",
};

const OWN_TYPE_LABELS: Record<string, string> = {
  with_mortgage: "Own with Mortgage",
  outright: "Own Outright",
};

const ID_TYPE_LABELS: Record<string, string> = {
  drivers_license: "Driver's License",
  passport: "Passport",
  state_id: "State ID",
  military_id: "Military ID",
};

const LOAN_TYPE_LABELS: Record<string, string> = {
  purchasing: "Purchasing",
  refinancing: "Refinancing",
};

const COUNTRY_LABELS: Record<string, string> = {
  us: "United States",
  ca: "Canada",
  gb: "United Kingdom",
  au: "Australia",
  de: "Germany",
  fr: "France",
  other: "Other",
};

const US_STATE_LABELS: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", CA: "California",
  CO: "Colorado", CT: "Connecticut", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", IL: "Illinois", NY: "New York", TX: "Texas",
  WA: "Washington", other: "Other",
};

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  } catch {
    return "";
  }
}

function fmtMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function fmtAddress(e: AddressEntry): string {
  const parts: string[] = [];
  if (e.address) parts.push(e.address);
  if (e.apartment) parts.push(`Apt ${e.apartment}`);
  const cityLine = [e.city, e.state ? (US_STATE_LABELS[e.state] ?? e.state) : ""].filter(Boolean).join(", ");
  if (cityLine) parts.push(cityLine + (e.zip ? ` ${e.zip}` : ""));
  if (e.country) parts.push(COUNTRY_LABELS[e.country] ?? e.country);
  return parts.join("\n");
}

function fmtCurrency(amount: string, currency: string): string {
  if (!amount) return "";
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency} ${amount}`;
  return `${currency} ${num.toLocaleString("en-US")}`;
}

function fmtIdLabel(idType: string, idState: string, idNumber: string): string {
  const type = ID_TYPE_LABELS[idType] ?? idType;
  const parts = [type];
  if (idState && idType !== "passport") parts.push(US_STATE_LABELS[idState] ?? idState);
  if (idNumber) parts.push(idNumber);
  return parts.join(" - ");
}

// ─── UI components ────────────────────────────────────────────────────────────

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-figtree), Figtree, sans-serif",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: "16px",
  color: "#727279",
};

const VALUE_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-figtree), Figtree, sans-serif",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  color: "#2f2f39",
  whiteSpace: "pre-line",
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-[2px]">
      <p style={LABEL_STYLE}>{label}</p>
      <p style={VALUE_STYLE}>{value}</p>
    </div>
  );
}

function SectionHeader({
  title,
  stepId,
  onEdit,
}: {
  title: string;
  stepId: string;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between w-full">
        <p
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "28px",
            color: "#2f2f39",
          }}
        >
          {title}
        </p>
        <button
          type="button"
          onClick={() => onEdit(stepId)}
          className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 shrink-0"
          aria-label={`Edit ${title}`}
        >
          <PenIcon fill="#4b0ea3" size={18} />
        </button>
      </div>
      <div style={{ height: 1, background: "#dcdcde", width: "100%" }} />
    </div>
  );
}

// ─── Consent Modal ────────────────────────────────────────────────────────────

const CONSENT_TEXT = `By submitting this application, I expressly authorize Shore Premier Finance and its approved financing partners to obtain my credit report and related financial information from one or more consumer credit reporting agencies for the purpose of evaluating my eligibility for credit or financing.

In accordance with applicable data protection regulations, including the General Data Protection Regulation (GDPR), I acknowledge and consent to:

The collection, use, and secure storage of my personal and financial information;

The sharing of necessary information with third-party lenders and service providers solely for the purpose of loan assessment, underwriting, and fulfillment;

The possibility that this authorization may involve a "hard" or "soft" credit inquiry, depending on the lending partner's process;

My right to request access to, correction of, or deletion of my personal data at any time, subject to applicable laws.

Shore Premier Finance handles all personal data using strict security protocols and adheres to SOC 2 Type II and GDPR standards. We only partner with reputable financing providers; however, we cannot guarantee that all third-party partners maintain the same security frameworks. Your personal data will never be sold, misused, and we do not allow our partners to do so either.`;

const CONSENT_CHECKBOX_LABEL =
  "I confirm that I have read and understood the above notice and hereby authorize Shore Premier Finance and its partners to access my credit and process my personal data for financing purposes.";

function ConsentModal({
  onClose,
  onAgree,
}: {
  onClose: () => void;
  onAgree: () => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(34,34,45,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal card */}
      <div
        className="relative flex flex-col bg-white rounded-[12px] overflow-hidden"
        style={{
          width: 720,
          maxHeight: "90vh",
          boxShadow: "0px 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between px-8 pt-8 pb-6 shrink-0">
          <h2
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "24px",
              lineHeight: "36px",
              color: "#2f2f39",
              maxWidth: 540,
            }}
          >
            Credit Report Authorization &amp; Data Consent Notice
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-none p-0 mt-1"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#2f2f39" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 pb-2 min-h-0">
          {CONSENT_TEXT.split("\n\n").map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "22px",
                color: "#3c3c46",
                marginBottom: "12px",
                margin: "0 0 12px 0",
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Checkbox + button area */}
        <div className="flex flex-col gap-6 px-8 pt-6 pb-8 shrink-0" style={{ borderTop: "1px solid #dcdcde" }}>
          {/* Checkbox row */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative shrink-0 mt-[2px]" style={{ width: 18, height: 18 }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div
                className="flex items-center justify-center rounded-[3px] transition-colors"
                style={{
                  width: 18,
                  height: 18,
                  border: checked ? "1.5px solid #4b0ea3" : "1.5px solid #dcdcde",
                  background: checked ? "#4b0ea3" : "#ffffff",
                }}
              >
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "22px",
                color: "#2f2f39",
              }}
            >
              {CONSENT_CHECKBOX_LABEL}
            </span>
          </label>

          {/* CTA button */}
          <button
            type="button"
            disabled={!checked}
            onClick={onAgree}
            className="flex w-full items-center justify-center h-12 rounded-[4px] transition-colors"
            style={{
              background: checked ? "#4b0ea3" : "#ccb9e7",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: checked ? "pointer" : "not-allowed",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                lineHeight: "24px",
                color: "#ffffff",
              }}
            >
              Agree &amp; Proceed
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function SummaryForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") ?? "individual";
  const done = searchParams.get("done") ?? "";
  const isCoBorrower = type === "co-borrower";

  const [showModal, setShowModal] = useState(false);

  // Load all stored state (client-side only)
  const [aboutYou, setAboutYou] = useState<AboutYouStored | null>(null);
  const [address, setAddress] = useState<AddressStored | null>(null);
  const [housing, setHousing] = useState<HousingStored | null>(null);
  const [employment, setEmployment] = useState<EmploymentStored | null>(null);
  const [income, setIncome] = useState<IncomeStored | null>(null);
  const [coBorrower, setCoBorrower] = useState<CoBorrowerStored | null>(null);
  const [boat, setBoat] = useState<BoatStored | null>(null);

  useEffect(() => {
    setAboutYou(load<AboutYouStored>("easyfund_about_you"));
    setAddress(load<AddressStored>("easyfund_address"));
    setHousing(load<HousingStored>("easyfund_housing"));
    setEmployment(load<EmploymentStored>("easyfund_employment"));
    setIncome(load<IncomeStored>("easyfund_income"));
    setCoBorrower(load<CoBorrowerStored>("easyfund_co_borrower"));
    setBoat(load<BoatStored>("easyfund_boat"));
  }, []);

  function handleEditStep(stepId: string) {
    router.push(`/apply/${stepId}?type=${type}&done=${done}`);
  }

  function handleSaveNext() {
    setShowModal(true);
  }

  function handleAgree() {
    setShowModal(false);
    router.push(`/verify?type=${type}&done=${done}`);
  }

  // ── Derived display values ──

  // Housing label
  function housingLabel(): string {
    if (!housing?.housingType) return "";
    if (housing.housingType === "own" && housing.ownType) {
      return OWN_TYPE_LABELS[housing.ownType] ?? housing.ownType;
    }
    return HOUSING_LABELS[housing.housingType] ?? housing.housingType;
  }

  // Government ID
  function idLabel(idType: string, idState: string, idNumber: string): string {
    if (!idType || !idNumber) return "";
    return fmtIdLabel(idType, idState, idNumber);
  }

  // Employment label from type + optional business/employer name
  function empTypeLabel(type: string): string {
    return EMPLOYMENT_LABELS[type] ?? type;
  }

  // Start date context for employment
  function empStartLabel(empType: string, startDate: string | null, retirementDate: string | null, otherDate: string | null): string {
    if (empType === "retired" && retirementDate) return fmtMonthYear(retirementDate);
    if (empType === "other" && otherDate) return fmtMonthYear(otherDate);
    return fmtMonthYear(startDate);
  }

  // Monthly income
  function monthlyIncomeLabel(amount: string, currency: string): string {
    return fmtCurrency(amount, currency);
  }

  // Income type label
  function incomeTypeLabel(type: string): string {
    return EMPLOYMENT_LABELS[type] ?? type;
  }

  return (
    <>
      <div className="relative flex flex-col gap-12 items-start overflow-x-hidden pb-20 pt-16 px-[276px] w-full">

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

        <div className="flex flex-col gap-10 items-start w-[564px]">

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 500,
              fontSize: "36px",
              lineHeight: "52px",
              letterSpacing: "-0.25px",
              color: "#2f2f39",
            }}
          >
            Summary of your Application
          </h1>

          {/* ── Address ── */}
          {address?.primary && (
            <div className="flex flex-col gap-5 w-full">
              <SectionHeader title="Address" stepId="address" onEdit={handleEditStep} />
              <div className="flex flex-col gap-4">
                <SummaryRow label="Address" value={fmtAddress(address.primary)} />
                <SummaryRow
                  label="When did you start living here?"
                  value={fmtMonthYear(address.primary.moveInDate)}
                />
                {address.history.map((h, i) => (
                  <SummaryRow
                    key={i}
                    label={i === 0 ? "Your previous address" : `Previous address ${i + 1}`}
                    value={fmtAddress(h)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Housing ── */}
          {housing?.housingType && (
            <div className="flex flex-col gap-5 w-full">
              <SectionHeader title="Housing" stepId="housing" onEdit={handleEditStep} />
              <div className="flex flex-col gap-4">
                <SummaryRow
                  label="Do you own, rent, or live rent-free?"
                  value={housingLabel()}
                />
                {housing.housingType !== "own" || housing.ownType !== "outright" ? (
                  <SummaryRow
                    label="What is your monthly housing payment?"
                    value={fmtCurrency(housing.monthlyPayment, housing.currency)}
                  />
                ) : null}
              </div>
            </div>
          )}

          {/* ── About You ── */}
          {aboutYou && (
            <div className="flex flex-col gap-5 w-full">
              <SectionHeader title="About You" stepId="about-you" onEdit={handleEditStep} />
              <div className="flex flex-col gap-4">
                {(aboutYou.firstName || aboutYou.lastName) && (
                  <SummaryRow
                    label="Full name"
                    value={[aboutYou.firstName, aboutYou.lastName].filter(Boolean).join(" ")}
                  />
                )}
                <SummaryRow label="Email" value={aboutYou.email} />
                <SummaryRow label="Phone number" value={aboutYou.phone} />
                <SummaryRow
                  label="What is your date of birth?"
                  value={fmtDate(aboutYou.dateOfBirth)}
                />
                <SummaryRow
                  label="What is your country of residence?"
                  value={COUNTRY_LABELS[aboutYou.country] ?? aboutYou.country}
                />
                <SummaryRow
                  label="What is your government-issued ID number?"
                  value={idLabel(aboutYou.idType, aboutYou.idState, aboutYou.idNumber)}
                />
                {aboutYou.hasSSN === "yes" && (
                  <SummaryRow label="What is your Social Security Number?" value={aboutYou.ssn} />
                )}
              </div>
            </div>
          )}

          {/* ── Employment ── */}
          {employment?.employmentType && (
            <div className="flex flex-col gap-5 w-full">
              <SectionHeader title="Employment" stepId="employment" onEdit={handleEditStep} />
              <div className="flex flex-col gap-4">
                <SummaryRow
                  label="What is your current employment status?"
                  value={empTypeLabel(employment.employmentType)}
                />

                {/* Self-employed */}
                {employment.employmentType === "self_employed" && (
                  <>
                    <SummaryRow label="What is the name of your business?" value={employment.businessName} />
                    <SummaryRow label="What is your job title?" value={employment.jobTitle} />
                    <SummaryRow
                      label="How long have you been self-employed?"
                      value={fmtMonthYear(employment.startDate)}
                    />
                  </>
                )}

                {/* W-2 */}
                {employment.employmentType === "w2" && (
                  <>
                    <SummaryRow label="What is the name of your employer?" value={employment.employerName} />
                    <SummaryRow label="What is your job title?" value={employment.jobTitle} />
                    <SummaryRow
                      label="When did you start working here?"
                      value={fmtMonthYear(employment.startDate)}
                    />
                  </>
                )}

                {/* Retired */}
                {employment.employmentType === "retired" && (
                  <>
                    <SummaryRow label="When did you retire?" value={fmtMonthYear(employment.retirementStartDate)} />
                  </>
                )}

                {/* Other */}
                {employment.employmentType === "other" && (
                  <>
                    <SummaryRow label="What is your income source?" value={employment.incomeSource} />
                    <SummaryRow
                      label="When did this income start?"
                      value={fmtMonthYear(employment.otherStartDate)}
                    />
                  </>
                )}

                <SummaryRow
                  label="What is your monthly income?"
                  value={fmtCurrency(employment.grossMonthlyIncome, employment.incomeCurrency)}
                />

                {/* Previous employers */}
                {employment.previousEmployers.map((b, i) => (
                  b.employerName ? (
                    <SummaryRow
                      key={i}
                      label={`Previous employer ${employment.previousEmployers.length > 1 ? i + 1 : ""}`}
                      value={[
                        b.employerName,
                        b.jobTitle,
                        [fmtMonthYear(b.startDate), fmtMonthYear(b.endDate)].filter(Boolean).join(" – "),
                      ].filter(Boolean).join(", ")}
                    />
                  ) : null
                ))}

                {employment.retiredPreviousEmployers.map((b, i) => (
                  b.employerName ? (
                    <SummaryRow
                      key={i}
                      label={`Previous employer ${employment.retiredPreviousEmployers.length > 1 ? i + 1 : ""}`}
                      value={[
                        b.employerName,
                        b.jobTitle,
                        [fmtMonthYear(b.startDate), fmtMonthYear(b.endDate)].filter(Boolean).join(" – "),
                      ].filter(Boolean).join(", ")}
                    />
                  ) : null
                ))}
              </div>
            </div>
          )}

          {/* ── Additional Income ── */}
          {income?.hasAdditionalIncome === "yes" && (
            <div className="flex flex-col gap-5 w-full">
              <SectionHeader title="Additional Income" stepId="income" onEdit={handleEditStep} />
              <div className="flex flex-col gap-4">
                <SummaryRow
                  label="What is your employment type?"
                  value={incomeTypeLabel(income.primary.incomeType)}
                />

                {income.primary.incomeType === "self_employed" && (
                  <>
                    <SummaryRow label="What is your business name?" value={income.primary.businessName} />
                    <SummaryRow label="What is your current position/title?" value={income.primary.jobTitle} />
                    <SummaryRow
                      label="How long have you been self-employed?"
                      value={fmtMonthYear(income.primary.startDate)}
                    />
                  </>
                )}

                {income.primary.incomeType === "w2" && (
                  <>
                    <SummaryRow label="What is the name of your employer?" value={income.primary.employerName} />
                    <SummaryRow label="What is your current position/title?" value={income.primary.jobTitle} />
                    <SummaryRow
                      label="When did you start working here?"
                      value={fmtMonthYear(income.primary.startDate)}
                    />
                  </>
                )}

                {income.primary.incomeType === "retired" && (
                  <SummaryRow
                    label="When did you retire?"
                    value={fmtMonthYear(income.primary.retirementStartDate)}
                  />
                )}

                {income.primary.incomeType === "other" && (
                  <>
                    <SummaryRow label="What is your income source?" value={income.primary.incomeSource} />
                    <SummaryRow
                      label="When did this income start?"
                      value={fmtMonthYear(income.primary.startDate)}
                    />
                  </>
                )}

                <SummaryRow
                  label="What is your gross monthly income before taxes?"
                  value={fmtCurrency(income.primary.monthlyIncome, income.primary.incomeCurrency)}
                />

                {income.primary.previousEmployers.map((b, i) => (
                  b.employerName ? (
                    <SummaryRow
                      key={i}
                      label={`Previous income source ${income.primary.previousEmployers.length > 1 ? i + 1 : ""}`}
                      value={[
                        b.employerName,
                        [fmtMonthYear(b.startDate), fmtMonthYear(b.endDate)].filter(Boolean).join(" – "),
                      ].filter(Boolean).join(", ")}
                    />
                  ) : null
                ))}

                {/* Extra income cards */}
                {income.extras.map((ex, i) => (
                  <div key={ex.id} className="flex flex-col gap-4 pt-2">
                    <p
                      style={{
                        fontFamily: "var(--font-poppins), Poppins, sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#727279",
                      }}
                    >
                      Other Income {i + 1}
                    </p>
                    <SummaryRow label="Employment type" value={incomeTypeLabel(ex.employmentType)} />
                    <SummaryRow label="Employer / business name" value={ex.employerName} />
                    <SummaryRow label="Job title" value={ex.jobTitle} />
                    <SummaryRow
                      label="Monthly income"
                      value={fmtCurrency(ex.monthlyIncome, ex.incomeCurrency)}
                    />
                    <SummaryRow label="Start date" value={fmtMonthYear(ex.startDate)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Co-Borrower Info ── */}
          {isCoBorrower && coBorrower && (
            <div className="flex flex-col gap-5 w-full">
              <SectionHeader title="Co-Borrower Info" stepId="co-borrower" onEdit={handleEditStep} />
              <div className="flex flex-col gap-4">
                {(coBorrower.firstName || coBorrower.lastName) && (
                  <SummaryRow
                    label="Name"
                    value={[coBorrower.firstName, coBorrower.lastName].filter(Boolean).join(" ")}
                  />
                )}
                <SummaryRow label="Email" value={coBorrower.email} />
                <SummaryRow label="Phone Number" value={coBorrower.phone} />
                <SummaryRow label="Date of Birth" value={fmtDate(coBorrower.dateOfBirth)} />
                <SummaryRow label="Address" value={fmtAddress(coBorrower.primaryAddress)} />
                {coBorrower.addressHistory.map((h, i) => (
                  <SummaryRow
                    key={i}
                    label={i === 0 ? "Co-Borrower's previous address" : `Previous address ${i + 1}`}
                    value={fmtAddress(h)}
                  />
                ))}
                <SummaryRow
                  label="Do Co-Borrower rent, own, or live rent-free?"
                  value={
                    coBorrower.housingType === "own" && coBorrower.ownType
                      ? (OWN_TYPE_LABELS[coBorrower.ownType] ?? coBorrower.ownType)
                      : (HOUSING_LABELS[coBorrower.housingType] ?? coBorrower.housingType)
                  }
                />
                {!(coBorrower.housingType === "own" && coBorrower.ownType === "outright") && (
                  <SummaryRow
                    label="What is Co-Borrower's monthly housing payment?"
                    value={fmtCurrency(coBorrower.monthlyPayment, coBorrower.paymentCurrency)}
                  />
                )}
                <SummaryRow
                  label="Co-Borrower's citizenship"
                  value={COUNTRY_LABELS[coBorrower.countryOfResidence] ?? coBorrower.countryOfResidence}
                />
                <SummaryRow
                  label="Co-Borrower's government-issued ID number"
                  value={idLabel(coBorrower.idType, coBorrower.idState, coBorrower.idNumber)}
                />
                {coBorrower.hasSSN === "yes" && (
                  <SummaryRow
                    label="What is Co-Borrower's Social Security Number?"
                    value={coBorrower.ssn}
                  />
                )}
                <SummaryRow
                  label="What is the Co-Borrower's employment type?"
                  value={empTypeLabel(coBorrower.employmentType)}
                />
                {coBorrower.employmentType === "self_employed" && (
                  <>
                    <SummaryRow label="What is the Co-Borrower's business name?" value={coBorrower.businessName} />
                    <SummaryRow label="What is the Co-Borrower's current position/title?" value={coBorrower.jobTitle} />
                    <SummaryRow
                      label="How long has the Co-Borrower been self-employed?"
                      value={fmtMonthYear(coBorrower.startDate)}
                    />
                  </>
                )}
                {coBorrower.employmentType === "w2" && (
                  <>
                    <SummaryRow label="What is the Co-Borrower's business name?" value={coBorrower.employerName} />
                    <SummaryRow label="What is the Co-Borrower's current position/title?" value={coBorrower.jobTitle} />
                    <SummaryRow
                      label="When did the Co-Borrower start working there?"
                      value={fmtMonthYear(coBorrower.startDate)}
                    />
                  </>
                )}
                {coBorrower.employmentType === "retired" && (
                  <SummaryRow
                    label="When did the Co-Borrower retire?"
                    value={fmtMonthYear(coBorrower.retirementStartDate)}
                  />
                )}
                {coBorrower.employmentType === "other" && (
                  <>
                    <SummaryRow label="Co-Borrower's income source" value={coBorrower.incomeSource} />
                    <SummaryRow
                      label="When did this income start?"
                      value={fmtMonthYear(coBorrower.otherStartDate)}
                    />
                  </>
                )}
                <SummaryRow
                  label="What is the Co-Borrower's gross monthly income before taxes?"
                  value={fmtCurrency(coBorrower.grossMonthlyIncome, coBorrower.incomeCurrency)}
                />
                {coBorrower.previousEmployers.map((b, i) => (
                  b.employerName ? (
                    <SummaryRow
                      key={i}
                      label={`Tell us about the Co-Borrower's previous employer (within the last 2 years)`}
                      value={[
                        b.employerName,
                        b.jobTitle,
                        [fmtMonthYear(b.startDate), fmtMonthYear(b.endDate)].filter(Boolean).join(" – "),
                      ].filter(Boolean).join(", ")}
                    />
                  ) : null
                ))}
                {coBorrower.retiredPreviousEmployers.map((b, i) => (
                  b.employerName ? (
                    <SummaryRow
                      key={i}
                      label="Co-Borrower's previous employer"
                      value={[
                        b.employerName,
                        b.jobTitle,
                        [fmtMonthYear(b.startDate), fmtMonthYear(b.endDate)].filter(Boolean).join(" – "),
                      ].filter(Boolean).join(", ")}
                    />
                  ) : null
                ))}
                <SummaryRow
                  label="Co-Borrower's relation to the Borrower"
                  value={coBorrower.relationship}
                />
              </div>
            </div>
          )}

          {/* ── Boat Information ── */}
          {boat?.loanType && (
            <div className="flex flex-col gap-5 w-full">
              <SectionHeader title="Boat Information" stepId="boat" onEdit={handleEditStep} />
              <div className="flex flex-col gap-4">
                <SummaryRow
                  label="Are you purchasing or refinancing?"
                  value={LOAN_TYPE_LABELS[boat.loanType] ?? boat.loanType}
                />
                {boat.loanType === "purchasing" && (
                  <>
                    <SummaryRow
                      label="Vessel Purchase Price"
                      value={fmtCurrency(boat.purchasePrice, boat.purchaseCurrency)}
                    />
                    <SummaryRow
                      label="Down Payment"
                      value={fmtCurrency(boat.downPayment, boat.downPaymentCurrency)}
                    />
                  </>
                )}
                {boat.loanType === "refinancing" && (
                  <SummaryRow
                    label="Loan Amount"
                    value={fmtCurrency(boat.loanAmount, boat.loanAmountCurrency)}
                  />
                )}
                <SummaryRow label="Make" value={boat.make} />
                <SummaryRow label="Model" value={boat.model} />
                <SummaryRow label="Year" value={boat.year} />
                <SummaryRow label="Engine Make" value={boat.engineMake} />
                <SummaryRow label="Engine Type" value={boat.engineType} />
                <SummaryRow label="Horsepower per Engine" value={boat.horsepowerPerEngine} />
                <SummaryRow label="Number of Engines" value={String(boat.numberOfEngines)} />
                <SummaryRow
                  label={
                    boat.loanType === "purchasing"
                      ? "Will the vessel be titled in a single purpose LLC?"
                      : "Is the vessel titled in a LLC?"
                  }
                  value={boat.llcTitled === "yes" ? "Yes" : boat.llcTitled === "no" ? "No" : ""}
                />
              </div>
            </div>
          )}

          {/* ── Save & Next ── */}
          <div className="flex items-center w-full">
            <button
              type="button"
              onClick={handleSaveNext}
              className="flex flex-1 items-center justify-center gap-2 h-10 px-5 rounded-[4px] cursor-pointer"
              style={{
                background: "#4b0ea3",
                border: "1px solid rgba(255,255,255,0.2)",
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
      </div>

      {/* Help button */}
      <div className="fixed bottom-14 right-14 z-40">
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

      {/* Consent Modal */}
      {showModal && (
        <ConsentModal onClose={() => setShowModal(false)} onAgree={handleAgree} />
      )}
    </>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <SummaryForm />
    </Suspense>
  );
}
