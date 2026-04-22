import type { Theme } from "../../theme";

interface Props {
  theme: Theme;
  label: string;
  value: string;
  mono?: boolean;
}

export function Pill({ theme, label, value, mono }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: theme.surfaceAlt,
        border: `1px solid ${theme.border}`,
        borderRadius: 6,
        fontSize: 12,
        color: theme.ink2,
      }}
    >
      <span
        style={{
          color: theme.ink3,
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? theme.monoFont : theme.numFont,
          fontVariantNumeric: "tabular-nums",
          color: theme.ink,
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}
