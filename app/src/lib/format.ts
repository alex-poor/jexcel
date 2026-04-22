/** Number formatters ported from tokens.js helpers. */

export const fmtInt = (n: number | null | undefined): string =>
  n == null ? "—" : n.toLocaleString("en-GB");

export const fmtPct = (n: number | null | undefined, digits = 1): string =>
  n == null ? "—" : `${(n * 100).toFixed(digits)}%`;

export const fmtDays = (n: number | null | undefined, digits = 2): string =>
  n == null ? "—" : n.toFixed(digits);

export const deltaPct = (
  curr: number | null | undefined,
  prev: number | null | undefined,
): number | null => {
  if (prev == null || prev === 0 || curr == null) return null;
  return (curr - prev) / prev;
};
