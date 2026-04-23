"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

function ApplyLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract step id from pathname: /apply/about-you -> "about-you"
  const segments = pathname.split("/").filter(Boolean);
  const currentStep = segments[segments.length - 1] ?? "about-you";

  // Parse completed steps from "done" param (comma-separated)
  const doneParam = searchParams.get("done") ?? "";
  const completedSteps = doneParam ? doneParam.split(",").filter(Boolean) : [];

  // Parse application type
  const typeParam = searchParams.get("type") ?? "";
  const applicationType =
    typeParam === "co-borrower" ? "co-borrower" : "individual";

  function handleEditStep(stepId: string) {
    const type = searchParams.get("type") ?? "";
    const done = searchParams.get("done") ?? "";
    router.push(`/apply/${stepId}?type=${type}&done=${done}`);
  }

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        applicationType={applicationType}
        onEditStep={handleEditStep}
      />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex bg-white">
        <div className="shrink-0 w-[324px] min-h-screen" />
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
    }>
      <ApplyLayoutInner>{children}</ApplyLayoutInner>
    </Suspense>
  );
}
