export default function ShorePremierLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="161"
      height="64"
      viewBox="0 0 161 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Shore Premier Finance"
    >
      {/* Star / compass rose at top */}
      <g transform="translate(80.5, 8)">
        <polygon points="0,-6 1.4,-1.4 6,0 1.4,1.4 0,6 -1.4,1.4 -6,0 -1.4,-1.4" fill="#1B3A6B" />
        <polygon points="0,-9 0.6,-1 9,0 0.6,1 0,9 -0.6,1 -9,0 -0.6,-1" fill="none" stroke="#1B3A6B" strokeWidth="0.6" />
      </g>

      {/* Top decorative line left */}
      <line x1="0" y1="22" x2="50" y2="22" stroke="#1B3A6B" strokeWidth="0.75" />
      {/* Top decorative line right */}
      <line x1="111" y1="22" x2="161" y2="22" stroke="#1B3A6B" strokeWidth="0.75" />

      {/* SHORE PREMIER text */}
      <text
        x="80.5"
        y="35"
        textAnchor="middle"
        fontFamily="var(--font-red-hat-display), 'Red Hat Display', serif"
        fontSize="13"
        fontWeight="600"
        letterSpacing="2.5"
        fill="#1B3A6B"
      >
        SHORE PREMIER
      </text>

      {/* Bottom decorative line left */}
      <line x1="0" y1="40" x2="30" y2="40" stroke="#1B3A6B" strokeWidth="0.75" />
      {/* Bottom decorative line right */}
      <line x1="131" y1="40" x2="161" y2="40" stroke="#1B3A6B" strokeWidth="0.75" />

      {/* FINANCE text */}
      <text
        x="80.5"
        y="50"
        textAnchor="middle"
        fontFamily="var(--font-red-hat-display), 'Red Hat Display', serif"
        fontSize="9"
        fontWeight="400"
        letterSpacing="4"
        fill="#1B3A6B"
      >
        FINANCE
      </text>

      {/* A DIVISION OF CENTENNIAL BANK */}
      <text
        x="80.5"
        y="60"
        textAnchor="middle"
        fontFamily="var(--font-red-hat-display), 'Red Hat Display', serif"
        fontSize="5.5"
        fontWeight="400"
        letterSpacing="1.2"
        fill="#1B3A6B"
      >
        A DIVISION OF CENTENNIAL BANK
      </text>
    </svg>
  );
}
