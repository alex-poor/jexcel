import type { ReactNode } from "react";
import type { Theme } from "../../theme";

interface Props {
  theme: Theme;
  density?: "comfortable" | "compact";
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  noPad?: boolean;
}

export function Card({ theme, density = "comfortable", title, subtitle, right, children, noPad }: Props) {
  const pad = density === "compact" ? 12 : 16;
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {(title || subtitle || right) && (
        <div
          style={{
            padding: `${pad}px ${pad}px ${subtitle ? 12 : pad}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            {title && (
              <div
                style={{
                  fontFamily: theme.numFont,
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.ink,
                  letterSpacing: "-0.005em",
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: 12, color: theme.ink3, marginTop: 3 }}>{subtitle}</div>
            )}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: noPad ? 0 : `0 ${pad}px ${pad}px` }}>{children}</div>
    </div>
  );
}
