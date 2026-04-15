import {
  FileIcon,
  MapPinIcon,
  SkyscraperIcon,
  BriefcaseIcon,
  CashIcon,
  UsersIcon,
  MotorYachtIcon,
  SummaryIcon,
} from "@/components/icons";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const steps = [
  { id: "about-you", label: "About You", icon: <FileIcon /> },
  { id: "address", label: "Address", icon: <MapPinIcon /> },
  { id: "housing", label: "Housing", icon: <SkyscraperIcon /> },
  { id: "employment", label: "Employment Info", icon: <BriefcaseIcon /> },
  { id: "income", label: "Additional Income", icon: <CashIcon /> },
  { id: "co-borrower", label: "Co-Borrower Info", icon: <UsersIcon /> },
  { id: "boat", label: "Boat Information", icon: <MotorYachtIcon /> },
  { id: "summary", label: "Summary", icon: <SummaryIcon /> },
];

interface SidebarProps {
  currentStep: string;
}

export default function Sidebar({ currentStep }: SidebarProps) {
  return (
    <aside
      className="relative shrink-0 w-[324px] min-h-screen overflow-hidden self-stretch"
    >
      {/* Background photo */}
      <div className="absolute inset-0">
        <img
          src={`${BASE}/images/sidebar-bg.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <img
          src={`${BASE}/images/sidebar-overlay1.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <img
          src={`${BASE}/images/sidebar-overlay2.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.35)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-10 pt-9 pb-8">

        {/* Brand title */}
        <div className="flex items-center gap-[10px] mb-6 shrink-0">
          <p
            style={{
              fontFamily: "var(--font-red-hat-display), 'Red Hat Display', sans-serif",
              fontWeight: 700,
              fontSize: "28px",
              lineHeight: "36.641px",
              letterSpacing: "-1.12px",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            EasyFund
          </p>
        </div>

        {/* Stepper */}
        <nav className="flex flex-col">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex gap-4 items-start pl-2">
                {/* Icon + connector */}
                <div className="flex flex-col items-center gap-1 pb-1 shrink-0">
                  {isActive ? (
                    /* Active step: larger 40px icon with border */
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(167,181,195,0.2)",
                        boxShadow: "0px 0px 0px 2px rgba(167,181,195,0.2)",
                      }}
                    >
                      {step.icon}
                    </div>
                  ) : (
                    /* Inactive step: smaller 28px icon */
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.2)",
                        boxShadow: "0px 4px 32px 0px rgba(140,140,140,0.24)",
                      }}
                    >
                      {step.icon}
                    </div>
                  )}

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      style={{
                        width: 2,
                        height: 12,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.2)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>

                {/* Step label */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    height: isActive ? 40 : 28,
                    minWidth: 0,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-figtree), Figtree, sans-serif",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: isActive ? "18px" : "16px",
                      lineHeight: isActive ? "28px" : "24px",
                      color: isActive ? "#ffffff" : "#a6a6ab",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div className="mt-auto">
          <p
            style={{
              fontFamily: "var(--font-figtree), Figtree, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "0px",
              color: "#ffffff",
              textTransform: "uppercase",
            }}
          >
            Shore Premier
          </p>
        </div>
      </div>
    </aside>
  );
}
