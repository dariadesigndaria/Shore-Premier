"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyTransitionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "individual";
  const done = searchParams.get("done") ?? "";
  const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  function handleVerify() {
    router.push(`/verify/id?type=${type}&done=${done}`);
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
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="flex flex-col gap-8 w-full max-w-[504px]">

          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 64, height: 64, background: "rgba(75,14,163,0.08)" }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 3L4 7V14C4 19.5 8.4 24.6 14 26C19.6 24.6 24 19.5 24 14V7L14 3Z"
                stroke="#4b0ea3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
              <path d="M10 14L12.5 16.5L18 11" stroke="#4b0ea3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-3">
            <h1
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                fontWeight: 500, fontSize: "36px", lineHeight: "48px",
                letterSpacing: "-0.25px", color: "#2f2f39",
              }}
            >
              Your Application is Almost Complete
            </h1>
            <p
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 400, fontSize: "18px", lineHeight: "28px", color: "#3c3c46",
              }}
            >
              Next, we need to verify your identity to continue with your application.
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleVerify}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-[4px] cursor-pointer"
            style={{ background: "#4b0ea3", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: 600, fontSize: "16px", lineHeight: "24px", color: "#ffffff",
              }}
            >
              Verify Your Identity
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
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

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f9f9]" />}>
      <VerifyTransitionInner />
    </Suspense>
  );
}
