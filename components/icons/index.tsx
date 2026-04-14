export function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="#727279" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M18 15L12 9L6 15" stroke="#2f2f39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownExpandIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="#2f2f39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="2.5" y="4" width="15" height="14" rx="1.5" stroke="#727279" strokeWidth="1.4" />
      <path d="M6.5 2.5V5.5M13.5 2.5V5.5" stroke="#727279" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.5 8H17.5" stroke="#727279" strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M4.167 10H15.833M15.833 10L10.833 5M15.833 10L10.833 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QuestionMarkIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M6 6C6 4.9 6.9 4 8 4C9.1 4 10 4.9 10 6C10 7.1 9.1 8 8 8V9.5" stroke="#22222d" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="#22222d" />
    </svg>
  );
}

/* ── Stepper step icons ── */

export function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M11.5 2.5H5.5C4.948 2.5 4.5 2.948 4.5 3.5V16.5C4.5 17.052 4.948 17.5 5.5 17.5H14.5C15.052 17.5 15.5 17.052 15.5 16.5V6.5L11.5 2.5Z" fill="white" />
      <path d="M11.5 2.5V6.5H15.5" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
      <path d="M7.5 10H12.5M7.5 12.5H12.5M7.5 7.5H10" stroke="rgba(34,34,45,0.4)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.515 10.485 1.5 8 1.5Z" fill="white" fillOpacity="0.8" />
      <circle cx="8" cy="6" r="2" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

export function SkyscraperIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1.5" y="2" width="8" height="12" rx="0.5" fill="white" fillOpacity="0.8" />
      <rect x="10" y="5" width="4.5" height="9" rx="0.5" fill="white" fillOpacity="0.6" />
      <rect x="3" y="4" width="1.5" height="1.5" fill="rgba(0,0,0,0.2)" />
      <rect x="5.5" y="4" width="1.5" height="1.5" fill="rgba(0,0,0,0.2)" />
      <rect x="3" y="7" width="1.5" height="1.5" fill="rgba(0,0,0,0.2)" />
      <rect x="5.5" y="7" width="1.5" height="1.5" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

export function BriefcaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1.5" y="5.5" width="13" height="8.5" rx="1" fill="white" fillOpacity="0.8" />
      <path d="M5.5 5.5V4C5.5 3.172 6.172 2.5 7 2.5H9C9.828 2.5 10.5 3.172 10.5 4V5.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.8" />
      <line x1="8" y1="8" x2="8" y2="11" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    </svg>
  );
}

export function CashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0.5" y="3.5" width="15" height="9" rx="1" fill="white" fillOpacity="0.8" />
      <circle cx="8" cy="8" r="2.5" fill="white" fillOpacity="0.4" />
      <rect x="0.5" y="5.5" width="3" height="5" fill="white" fillOpacity="0.3" />
      <rect x="12.5" y="5.5" width="3" height="5" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="6" cy="5" r="2.5" fill="white" fillOpacity="0.8" />
      <path d="M1 13.5C1 10.962 3.239 8.5 6 8.5C8.761 8.5 11 10.962 11 13.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.8" strokeLinecap="round" />
      <circle cx="11.5" cy="5.5" r="2" fill="white" fillOpacity="0.6" />
      <path d="M9.5 13.5C9.5 12 10.6 10.5 12.5 10C13.3 9.8 14.5 10 15 11" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

export function MotorYachtIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1 11.5L3 7.5H13L15 11.5H1Z" fill="white" fillOpacity="0.8" />
      <path d="M5 7.5V4.5L10 6.5V7.5" stroke="white" strokeWidth="1" strokeOpacity="0.8" />
      <path d="M1 13C2.5 14 4 14 5.5 13C7 12 9 12 10.5 13C12 14 13.5 14 15 13" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

export function SummaryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="1.5" width="12" height="13" rx="1" fill="white" fillOpacity="0.8" />
      <path d="M5 5.5H11M5 8H11M5 10.5H8.5" stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeLinecap="round" />
      <path d="M6 1.5V3.5H10V1.5" stroke="white" strokeWidth="1" strokeOpacity="0.8" />
    </svg>
  );
}
