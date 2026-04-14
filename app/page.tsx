"use client";

import Link from "next/link";
import Image from "next/image";
import ShorePremierLogo from "@/components/ShorePremierLogo";
import YachtwayLogo from "@/components/YachtwayLogo";

export default function TypeOfApplicationPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: "linear-gradient(183.979deg, #f9f9f9 27.937%, #f9fafb 12.669%)",
      }}
    >
      {/* White card container */}
      <div className="bg-white flex flex-col gap-12 items-center w-full max-w-[1440px] min-h-[800px]">

        {/* Header */}
        <div className="w-full border-b-2 border-[rgba(112,128,144,0.04)] h-[72px] flex items-center justify-center bg-white shrink-0">
          <ShorePremierLogo />
        </div>

        {/* Main content */}
        <div className="flex flex-col items-end px-[296px] pb-14 w-full">
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
                className="flex-1 h-[304px] rounded-[4px] overflow-hidden relative border-2 border-[rgba(34,34,45,0.04)] bg-[rgba(112,128,144,0.04)] hover:border-[rgba(34,34,45,0.12)] transition-colors block"
              >
                <div className="absolute top-0 left-0 right-0 h-[224px]">
                  <Image
                    src="/images/card-individually-photo.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="272px"
                  />
                  <Image
                    src="/images/card-individually-overlay.png"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="272px"
                  />
                </div>
                <p
                  className="absolute left-[26px] bottom-[14px]"
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
                className="flex-1 h-[304px] rounded-[4px] overflow-hidden relative border-2 border-[rgba(34,34,45,0.04)] bg-[rgba(112,128,144,0.04)] hover:border-[rgba(34,34,45,0.12)] transition-colors block"
              >
                <div className="absolute top-0 left-0 right-0 h-[224px]">
                  <Image
                    src="/images/card-coborrower-photo.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="272px"
                  />
                  <Image
                    src="/images/card-coborrower-overlay.png"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="272px"
                  />
                </div>
                <p
                  className="absolute bottom-[14px] left-[50%] translate-x-[-50%]"
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
      <div className="w-full border-t-4 border-[#f6f6f7] px-[100px] py-6 flex flex-col items-center gap-2">
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
