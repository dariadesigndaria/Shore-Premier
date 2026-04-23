"use client";

import Link from "next/link";
import YachtwayLogo from "@/components/YachtwayLogo";
import { PersonIcon, UsersIcon } from "@/components/icons";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function TypeOfApplicationPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: "#ffffff" }}
    >
      {/* White card container */}
      <div className="bg-white flex flex-col gap-12 items-center w-full max-w-[1440px] min-h-[800px]">

        {/* Header */}
        <div className="w-full border-b-2 border-[rgba(112,128,144,0.04)] h-[72px] flex items-center justify-center bg-white shrink-0">
          <img
            src={`${BASE}/images/main-logo.png`}
            alt="Shore Premier Finance"
            style={{ height: 48, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center px-[296px] pb-14 w-full">
          <div className="flex flex-col gap-8 items-start w-[564px]">
            <h1
              style={{
                fontFamily: "var(--font-red-hat-display), 'Red Hat Display', sans-serif",
                fontWeight: 600,
                fontSize: "36px",
                lineHeight: "48px",
                color: "#22222d",
              }}
            >
              How are you applying?
            </h1>

            {/* Cards */}
            <div className="flex gap-5 w-full">
              {/* Individually */}
              <Link
                href="/apply/about-you?type=individual"
                className="flex-1 h-[200px] rounded-[4px] flex flex-col items-start gap-8 pl-6 pt-8 pb-6 border-2 border-[rgba(34,34,45,0.06)] bg-[rgba(112,128,144,0.04)] hover:border-[rgba(75,14,163,0.3)] hover:bg-[rgba(75,14,163,0.03)] transition-colors"
              >
                <PersonIcon size={48} fill="#9ca3af" />
                <p
                  style={{
                    fontFamily: "var(--font-red-hat-display), 'Red Hat Display', sans-serif",
                    fontWeight: 500,
                    fontSize: "22px",
                    lineHeight: "28px",
                    color: "#22222d",
                    whiteSpace: "nowrap",
                  }}
                >
                  Individually
                </p>
              </Link>

              {/* With a Co-Borrower */}
              <Link
                href="/apply/about-you?type=co-borrower"
                className="flex-1 h-[200px] rounded-[4px] flex flex-col items-start gap-8 pl-6 pt-8 pb-6 border-2 border-[rgba(34,34,45,0.06)] bg-[rgba(112,128,144,0.04)] hover:border-[rgba(75,14,163,0.3)] hover:bg-[rgba(75,14,163,0.03)] transition-colors"
              >
                <UsersIcon size={48} fill="#9ca3af" />
                <p
                  style={{
                    fontFamily: "var(--font-red-hat-display), 'Red Hat Display', sans-serif",
                    fontWeight: 500,
                    fontSize: "22px",
                    lineHeight: "28px",
                    color: "#22222d",
                    whiteSpace: "nowrap",
                  }}
                >
                  With a Co-Borrower
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full border-t-4 border-[#f6f6f7] flex flex-col items-center justify-center gap-2" style={{ height: "115px", flexShrink: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "18px",
            color: "#727279",
            textTransform: "uppercase",
          }}
        >
          Powered by
        </p>
        <YachtwayLogo />
      </div>
    </div>
  );
}
