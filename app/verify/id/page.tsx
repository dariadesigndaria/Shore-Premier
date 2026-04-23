"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyIdInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "individual";
  const done = searchParams.get("done") ?? "";
  const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  function handleContinue() {
    router.push(`/documents?type=${type}&done=${done}`);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f9f9f9" }}
    >
      {/* Header */}
      <header
        className="w-full shrink-0 flex items-center justify-center"
        style={{ height: 72, background: "#ffffff", borderBottom: "1px solid rgba(112,128,144,0.08)" }}
      >
        <img
          src={`${BASE}/images/main-logo.png`}
          alt="Shore Premier Finance"
          style={{ height: 44, width: "auto", objectFit: "contain" }}
        />
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex flex-col gap-8 w-full max-w-[504px]">

          {/* Shield icon */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 64, height: 64, background: "rgba(75,14,163,0.08)" }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 3L4 7V14C4 19.5 8.4 24.6 14 26C19.6 24.6 24 19.5 24 14V7L14 3Z"
                stroke="#4b0ea3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
              <path d="M11 14H17M14 11V17" stroke="#4b0ea3" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Title + description */}
          <div className="flex flex-col gap-3">
            <h1
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                fontWeight: 500, fontSize: "36px", lineHeight: "48px",
                letterSpacing: "-0.25px", color: "#2f2f39",
              }}
            >
              Identity Verification
            </h1>
            <p
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400, fontSize: "16px", lineHeight: "26px", color: "#3c3c46",
              }}
            >
              To continue, you will be securely redirected to our identity
              verification provider. Your data is encrypted and protected at
              every step.
            </p>
          </div>

          {/* Info cards */}
          <div className="flex flex-col gap-3">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="7.5" stroke="#4b0ea3" strokeWidth="1.4" />
                    <path d="M10 6.5V10.5L12.5 13" stroke="#4b0ea3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Quick process",
                body: "This typically takes 1–2 minutes to complete.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="7" width="14" height="10" rx="1.5" stroke="#4b0ea3" strokeWidth="1.4" />
                    <path d="M7 7V5C7 3.343 8.343 2 10 2C11.657 2 13 3.343 13 5V7" stroke="#4b0ea3" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="10" cy="12" r="1" fill="#4b0ea3" />
                  </svg>
                ),
                title: "Have your ID ready",
                body: "Please have a valid government-issued photo ID available.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2L3 5.5V10C3 14.125 6.3 17.95 10 19C13.7 17.95 17 14.125 17 10V5.5L10 2Z" stroke="#4b0ea3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7.5 10L9.5 12L13 8" stroke="#4b0ea3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Bank-grade security",
                body: "Your information is encrypted using industry-standard protocols.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-[8px] px-5 py-4"
                style={{ background: "#ffffff", border: "1px solid #ebebed" }}
              >
                <div className="shrink-0 mt-[1px]">{item.icon}</div>
                <div className="flex flex-col gap-[2px]">
                  <p
                    style={{
                      fontFamily: "var(--font-figtree), Figtree, sans-serif",
                      fontWeight: 600, fontSize: "14px", lineHeight: "20px", color: "#2f2f39",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-figtree), Figtree, sans-serif",
                      fontWeight: 400, fontSize: "13px", lineHeight: "19px", color: "#727279",
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-[4px] cursor-pointer"
            style={{ background: "#4b0ea3", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 600, fontSize: "16px", lineHeight: "24px", color: "#ffffff",
              }}
            >
              Continue to Verification
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Security note */}
          <p
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 400, fontSize: "12px", lineHeight: "18px",
              color: "#a6a6ab", textAlign: "center",
            }}
          >
            By continuing, you consent to identity verification as part of the Shore Premier Finance loan application process.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 py-6 flex items-center justify-center">
        <p
          style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 500, fontSize: "12px", lineHeight: "16px",
            letterSpacing: "0.5px", color: "#a6a6ab", textTransform: "uppercase",
          }}
        >
          Shore Premier Finance
        </p>
      </footer>
    </div>
  );
}

export default function VerifyIdPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f9f9]" />}>
      <VerifyIdInner />
    </Suspense>
  );
}
