import { useState } from "react";
import type { MouseEvent as ReactMouseEvent, SVGProps } from "react";
import type { Theme } from "../../theme";

interface TTState {
  x: number;
  y: number;
  content: string;
}

/** Hook returning a stateful tooltip + a `wrap(props)` helper that turns
 *  `{ 'data-tt': 'multi\nline' }` into mouse handlers that show the tooltip. */
export function useTooltip() {
  const [tt, setTT] = useState<TTState | null>(null);

  type Wrapped<P> = P & {
    onMouseEnter: (e: ReactMouseEvent) => void;
    onMouseMove: (e: ReactMouseEvent) => void;
    onMouseLeave: () => void;
  };

  const wrap = <P extends SVGProps<SVGGElement> & { "data-tt"?: string }>(
    props: P,
  ): Wrapped<P> => {
    const content = props["data-tt"] ?? "";
    return {
      ...props,
      onMouseEnter: (e: ReactMouseEvent) => setTT({ x: e.clientX, y: e.clientY, content }),
      onMouseMove: (e: ReactMouseEvent) =>
        setTT((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t)),
      onMouseLeave: () => setTT(null),
    };
  };

  return { tt, wrap };
}

export function Tooltip({ tt, theme }: { tt: TTState | null; theme: Theme }) {
  if (!tt) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: tt.x + 14,
        top: tt.y + 14,
        zIndex: 1000,
        background: theme.ink,
        color: theme.bg,
        padding: "8px 10px",
        borderRadius: 6,
        fontSize: 12,
        lineHeight: 1.35,
        fontFamily: theme.sansFont,
        pointerEvents: "none",
        boxShadow: "0 6px 20px rgba(0,0,0,.18)",
        maxWidth: 220,
        whiteSpace: "pre-line",
      }}
    >
      {tt.content}
    </div>
  );
}
