"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import SingleSelector from "@/components/form/SingleSelector";
import ExpandableQuestion from "@/components/form/ExpandableQuestion";
import { CalendarIcon, ArrowRightIcon, QuestionMarkIcon } from "@/components/icons";

const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "other", label: "Other" },
];

const ID_TYPES = [
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "state_id", label: "State ID" },
  { value: "military_id", label: "Military ID" },
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

const SSN_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  country: string;
  idType: string;
  idState: string;
  idNumber: string;
  hasSSN: string;
  ssn: string;
}

export default function AboutYouPage() {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: null,
    country: "",
    idType: "",
    idState: "",
    idNumber: "",
    hasSSN: "",
    ssn: "",
  });

  function update(field: keyof FormData) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleInput(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "24px",
    lineHeight: "36px",
    letterSpacing: "0px",
    color: "#2f2f39",
  };

  const mainTitleStyle: React.CSSProperties = {
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    fontWeight: 500,
    fontSize: "36px",
    lineHeight: "52px",
    letterSpacing: "-0.25px",
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
        Save  &amp; Exit
      </button>

      {/* Form block */}
      <div className="flex flex-col gap-8 items-start w-[564px]">

        {/* ── Section: Personal Details ── */}
        <div className="flex flex-col gap-5 w-full">
          <h1 style={mainTitleStyle}>What are your personal details</h1>

          {/* First Name + Last Name */}
          <div className="flex gap-5 w-full">
            <Input
              label="First Name"
              required
              value={form.firstName}
              onChange={handleInput("firstName")}
            />
            <Input
              label="Last Name"
              required
              value={form.lastName}
              onChange={handleInput("lastName")}
            />
          </div>

          {/* Email + Phone */}
          <div className="flex gap-5 w-full">
            <Input
              label="Email"
              required
              type="email"
              value={form.email}
              onChange={handleInput("email")}
            />
            <Input
              label="Phone Number"
              required
              type="tel"
              value={form.phone}
              onChange={handleInput("phone")}
            />
          </div>
        </div>

        {/* ── Section: Date of Birth ── */}
        <div className="flex flex-col gap-6 w-full">
          <h2 style={sectionHeadingStyle}>What is your date of birth?</h2>
          <DatePicker
            selected={form.dateOfBirth}
            onChange={(date: Date | null) => setForm((prev) => ({ ...prev, dateOfBirth: date }))}
            dateFormat="MM/dd/yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            maxDate={new Date()}
            placeholderText=""
            customInput={
              <div
                className="relative flex items-center h-[48px] px-3 rounded-[2px] border border-[#dcdcde] bg-white cursor-pointer hover:border-[#a6a6ab] w-full"
                style={{ minWidth: 0 }}
              >
                <span
                  className="absolute left-3 pointer-events-none select-none transition-all duration-150"
                  style={
                    form.dateOfBirth
                      ? {
                          fontFamily: "var(--font-figtree), Figtree, sans-serif",
                          fontWeight: 500,
                          fontSize: "11px",
                          lineHeight: "16px",
                          color: "#a6a6ab",
                          top: "5px",
                        }
                      : {
                          fontFamily: "var(--font-figtree), Figtree, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "#727279",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }
                  }
                >
                  Date of Birth*
                </span>
                {form.dateOfBirth && (
                  <span
                    className="absolute left-3"
                    style={{
                      fontFamily: "var(--font-figtree), Figtree, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#2f2f39",
                      top: "20px",
                    }}
                  >
                    {form.dateOfBirth.toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CalendarIcon />
                </div>
              </div>
            }
          />
        </div>

        {/* ── Section: Country of Residence ── */}
        <div className="flex flex-col gap-5 w-full">
          <h2 style={sectionHeadingStyle}>What is your country of residence</h2>
          <div className="flex flex-col gap-3 w-full">
            <Select
              label="Country of Residence"
              required
              options={COUNTRIES}
              value={form.country}
              onChange={update("country")}
            />
          </div>
          <ExpandableQuestion
            answer="We ask for your country of residence to ensure we show financing options and terms that apply to your location and comply with local regulations."
          />
        </div>

        {/* ── Section: Government-issued ID ── */}
        <div className="flex flex-col gap-6 w-full">
          <h2 style={sectionHeadingStyle}>What is your government-issued ID number?</h2>

          <div className="flex flex-col gap-5 w-full">
            {/* ID Type + State of Issue */}
            <div className="flex gap-5 w-full">
              <Select
                label="ID Type"
                required
                options={ID_TYPES}
                value={form.idType}
                onChange={update("idType")}
              />
              <Select
                label="State of Issue"
                required
                options={US_STATES}
                value={form.idState}
                onChange={update("idState")}
              />
            </div>

            {/* ID Number */}
            <Input
              label="ID Number"
              required
              value={form.idNumber}
              onChange={handleInput("idNumber")}
            />
          </div>

          <ExpandableQuestion
            answer="Lenders require your government-issued ID number to verify your identity, prevent fraud, and comply with federal regulations. This helps ensure your loan application is processed securely and accurately."
          />
        </div>

        {/* ── Section: SSN ── */}
        <div className="flex flex-col gap-6 w-full">
          <h2 style={sectionHeadingStyle}>Do you have a Social Security Number?</h2>
          <SingleSelector
            options={SSN_OPTIONS}
            value={form.hasSSN}
            onChange={update("hasSSN")}
          />
        </div>

        {/* ── Section: SSN Number (conditional) ── */}
        {form.hasSSN === "yes" && (
          <div className="flex flex-col gap-6 w-full">
            <h2 style={sectionHeadingStyle}>What is your Social Security Number?</h2>
            <div className="flex flex-col gap-5 w-full">
              <Input
                label="SSN Number"
                required
                type="password"
                value={form.ssn}
                onChange={handleInput("ssn")}
              />
            </div>
            <ExpandableQuestion
              answer="Your Social Security Number is used to verify your identity, check your credit history, and comply with federal lending regulations. For pre-qualification, this will only result in a soft credit pull, which does not affect your credit score."
            />
          </div>
        )}

        {/* ── Navigation: Save & Next ── */}
        <div className="flex gap-0 items-center w-full">
          <button
            type="button"
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
