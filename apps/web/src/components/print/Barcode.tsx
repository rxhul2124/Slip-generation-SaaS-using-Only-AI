import { useMemo } from "react";

export function Barcode({ value = "PACKSLIP", height = 42 }: { value?: string; height?: number }) {
  const bars = useMemo(() => {
    const bits = Array.from(value).flatMap((char) => {
      const code = char.charCodeAt(0);
      return Array.from({ length: 7 }, (_, index) => Boolean(code & (1 << index)));
    });
    return [true, false, true, ...bits, true, false, true];
  }, [value]);

  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="flex w-full justify-center overflow-hidden bg-white px-1" style={{ height }}>
        {bars.map((bar, index) => (
          <span
            key={`${index}-${bar}`}
            style={{ width: bar ? 2 : 1, marginRight: 1 }}
            className={bar ? "h-full bg-black" : "h-full bg-white"}
          />
        ))}
      </div>
      <span className="font-mono text-[8px] leading-none text-black">{value}</span>
    </div>
  );
}
