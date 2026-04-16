import Link from "next/link";
import {
  FileIcon,
  MapPinIcon,
  SkyscraperIcon,
  BriefcaseIcon,
  CashIcon,
  UsersIcon,
  MotorYachtIcon,
  SummaryIcon,
  CheckmarkIcon,
  PenIcon,
} from "@/components/icons";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const steps = [
  { id: "about-you", label: "About You", icon: (size: number, fill: string) => <FileIcon size={size} fill={fill} /> },
  { id: "address", label: "Address", icon: (size: number, fill: string) => <MapPinIcon size={size} fill={fill} /> },
  { id: "housing", label: "Housing", icon: (size: number, fill: string) => <SkyscraperIcon size={size} fill={fill} /> },
  { id: "employment", label: "Employment Info", icon: (size: number, fill: string) => <BriefcaseIcon size={size} fill={fill} /> },
  { id: "income", label: "Additional Income", icon: (size: number, fill: string) => <CashIcon size={size} fill={fill} /> },
  { id: "co-borrower", label: "Co-Borrower Info", icon: (size: number, fill: string) => <UsersIcon size={size} fill={fill} /> },
  { id: "boat", label: "Boat Information", icon: (size: number, fill: string) => <MotorYachtIcon size={size} fill={fill} /> },
  { id: "summary", label: "Summary", icon: (size: number, fill: string) => <SummaryIcon size={size} fill={fill} /> },
];

interface SidebarProps {
  currentStep: string;
  completedSteps?: string[];
  applicationType?: "individual" | "co-borrower";
  onEditStep?: (stepId: string) => void;
}

export default function Sidebar({ currentStep, completedSteps = [], onEditStep }: SidebarProps) {
  return (
    <aside className="sticky top-0 h-screen shrink-0 w-[324px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={`${BASE}/images/sidebar-bg.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <img src={`${BASE}/images/sidebar-overlay1.png`} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <img src={`${BASE}/images/sidebar-overlay2.png`} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.35)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-10 pt-9 pb-8">

        {/* Brand */}
        <div className="flex items-center gap-[10px] mb-6 shrink-0">
          <Link href="/" className="no-underline">
            <p style={{
              fontFamily: "var(--font-red-hat-display), 'Red Hat Display', sans-serif",
              fontWeight: 700,
              fontSize: "28px",
              lineHeight: "36.641px",
              letterSpacing: "-1.12px",
              color: "#ffffff",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}>
              EasyFund
            </p>
          </Link>
        </div>

        {/* Stepper */}
        <nav className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex gap-4 items-start pl-2 w-full">
                {/* Icon + connector column */}
                <div className="flex flex-col items-center gap-1 pb-1 shrink-0">
                  {isActive ? (
                    <div className="flex items-center justify-center shrink-0" style={{
                      width: 40, height: 40, borderRadius: 4,
                      background: "rgba(255,255,255,0.4)",
                      border: "1px solid rgba(167,181,195,0.2)",
                      boxShadow: "0px 0px 0px 2px rgba(167,181,195,0.2)",
                    }}>
                      {step.icon(20, "white")}
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center justify-center shrink-0" style={{
                      width: 28, height: 28, borderRadius: 4,
                      background: "#ffffff",
                      boxShadow: "0px 4px 32px 0px rgba(140,140,140,0.24)",
                    }}>
                      {step.icon(16, "#4b0ea3")}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center shrink-0" style={{
                      width: 28, height: 28, borderRadius: 4,
                      background: "rgba(255,255,255,0.2)",
                      boxShadow: "0px 4px 32px 0px rgba(140,140,140,0.24)",
                    }}>
                      {step.icon(16, "white")}
                    </div>
                  )}

                  {!isLast && (
                    <div style={{
                      width: 2, height: 12, borderRadius: 8, flexShrink: 0,
                      background: isCompleted ? "#ffffff" : "rgba(255,255,255,0.2)",
                    }} />
                  )}
                </div>

                {/* Label + icons row — flex-1 so the icon pair is pushed to the right */}
                <div
                  className="flex items-center justify-between flex-1 min-w-0"
                  style={{ height: isActive ? 40 : 28 }}
                >
                  <p style={{
                    fontFamily: "var(--font-figtree), Figtree, sans-serif",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: isActive ? "18px" : "16px",
                    lineHeight: isActive ? "28px" : "24px",
                    color: isActive ? "#ffffff" : isCompleted ? "#ffffff" : "#a6a6ab",
                    whiteSpace: "nowrap",
                  }}>
                    {step.label}
                  </p>

                  {isCompleted && (
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <CheckmarkIcon fill="white" size={16} />
                      <button
                        type="button"
                        className="cursor-pointer bg-transparent border-none p-0 flex items-center"
                        onClick={() => onEditStep?.(step.id)}
                        aria-label={`Edit ${step.label}`}
                      >
                        <PenIcon fill="white" size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div className="shrink-0 mt-4">
          <p style={{
            fontFamily: "var(--font-figtree), Figtree, sans-serif",
            fontWeight: 500, fontSize: "14px", lineHeight: "20px",
            color: "#ffffff", textTransform: "uppercase",
          }}>
            Shore Premier
          </p>
        </div>
      </div>
    </aside>
  );
}
