import type { Theme } from "../../theme";
import type { HierarchyNode } from "../../data/sample";

type Density = "comfortable" | "compact";

interface SidebarProps {
  theme: Theme;
  density: Density;
  hierarchy: HierarchyNode[];
  selected: string;
  onSelect: (id: string) => void;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function Sidebar({ theme, density, hierarchy, selected, onSelect, expanded, onToggle }: SidebarProps) {
  const pad = density === "compact" ? 5 : 7;
  const total = hierarchy.reduce((a, b) => a + b.count, 0);
  return (
    <div
      style={{
        width: 240,
        borderRight: `1px solid ${theme.border}`,
        background: theme.surfaceAlt,
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.sansFont,
        color: theme.ink,
      }}
    >
      <div
        style={{
          padding: "14px 16px 10px",
          fontSize: 11,
          textTransform: "uppercase",
          color: theme.ink3,
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
      >
        Departments
      </div>
      <div style={{ padding: "0 8px", flex: 1, overflow: "auto" }}>
        <TreeNode
          theme={theme}
          label="All departments"
          count={total}
          active={selected === "all"}
          onClick={() => onSelect("all")}
          pad={pad}
          depth={0}
        />
        {hierarchy.map((l1) => (
          <div key={l1.id}>
            <TreeNode
              theme={theme}
              label={l1.label}
              count={l1.count}
              active={selected === l1.id}
              expanded={expanded[l1.id]}
              hasChildren
              onClick={() => onSelect(l1.id)}
              onToggle={() => onToggle(l1.id)}
              pad={pad}
              depth={0}
            />
            {expanded[l1.id] &&
              l1.children?.map((l2) => (
                <TreeNode
                  key={l2.id}
                  theme={theme}
                  label={l2.label}
                  count={l2.count}
                  active={selected === l2.id}
                  onClick={() => onSelect(l2.id)}
                  pad={pad}
                  depth={1}
                />
              ))}
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "10px 16px",
          borderTop: `1px solid ${theme.border}`,
          fontSize: 11,
          color: theme.ink3,
        }}
      >
        Last refreshed 09:14
      </div>
    </div>
  );
}

interface TreeNodeProps {
  theme: Theme;
  label: string;
  count: number;
  active?: boolean;
  expanded?: boolean;
  hasChildren?: boolean;
  onClick: () => void;
  onToggle?: () => void;
  pad: number;
  depth: number;
}

function TreeNode({ theme, label, count, active, expanded, hasChildren, onClick, onToggle, pad, depth }: TreeNodeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: `${pad}px 8px ${pad}px ${8 + depth * 14}px`,
        borderRadius: 5,
        background: active ? theme.accentSoft : "transparent",
        color: active ? theme.accentInk : theme.ink2,
        cursor: "pointer",
        userSelect: "none",
        margin: "1px 0",
        fontWeight: active ? 600 : 400,
        fontSize: 13,
      }}
      onClick={onClick}
    >
      {hasChildren ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          style={{
            width: 14,
            height: 14,
            display: "grid",
            placeItems: "center",
            color: theme.ink3,
            fontSize: 9,
            marginRight: 2,
          }}
        >
          {expanded ? "▾" : "▸"}
        </div>
      ) : (
        <div style={{ width: 16 }} />
      )}
      <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div
        style={{
          fontSize: 11,
          fontFamily: theme.numFont,
          fontVariantNumeric: "tabular-nums",
          color: active ? theme.accentInk : theme.ink3,
          background: active ? theme.surface : "transparent",
          padding: active ? "1px 6px" : "1px 4px",
          borderRadius: 10,
        }}
      >
        {count.toLocaleString()}
      </div>
    </div>
  );
}
