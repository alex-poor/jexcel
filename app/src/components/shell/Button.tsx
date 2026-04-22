import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "../../theme";

interface Props {
  theme: Theme;
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  ghost?: boolean;
  disabled?: boolean;
}

export function Button({ theme, children, onClick, primary, ghost, disabled }: Props) {
  const style: CSSProperties = {
    padding: ghost ? "6px 10px" : "7px 14px",
    border: `1px solid ${primary ? theme.accent : theme.border}`,
    background: primary ? theme.accent : theme.surface,
    color: primary ? "#fff" : theme.ink,
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: theme.sansFont,
    opacity: disabled ? 0.5 : 1,
  };
  if (ghost) {
    style.background = "transparent";
    style.border = "1px solid transparent";
    style.color = theme.ink2;
  }
  return (
    <button style={style} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {children}
    </button>
  );
}
