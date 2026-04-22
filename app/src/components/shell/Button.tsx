import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "../../theme";

interface Props {
  theme: Theme;
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  ghost?: boolean;
}

export function Button({ theme, children, onClick, primary, ghost }: Props) {
  const style: CSSProperties = {
    padding: ghost ? "6px 10px" : "7px 14px",
    border: `1px solid ${primary ? theme.accent : theme.border}`,
    background: primary ? theme.accent : theme.surface,
    color: primary ? "#fff" : theme.ink,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: theme.sansFont,
  };
  if (ghost) {
    style.background = "transparent";
    style.border = "1px solid transparent";
    style.color = theme.ink2;
  }
  return (
    <button style={style} onClick={onClick}>
      {children}
    </button>
  );
}
