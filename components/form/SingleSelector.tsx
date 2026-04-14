interface SingleSelectorProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function SingleSelector({ options, value, onChange }: SingleSelectorProps) {
  return (
    <div className="flex gap-5 w-full">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange?.(opt.value)}
            className="flex-1 flex items-center justify-center py-2 px-5 rounded-[2px] border transition-colors cursor-pointer"
            style={{
              backgroundColor: isSelected ? "#fcfafe" : "#ffffff",
              borderColor: isSelected ? "#4b0ea3" : "#dcdcde",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-figtree), Figtree, sans-serif",
                fontWeight: isSelected ? 500 : 400,
                fontSize: "18px",
                lineHeight: "28px",
                color: isSelected ? "#4b0ea3" : "#2f2f39",
              }}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
