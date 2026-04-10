// Format a raw string into a dollar display: "$1,234,567"
export function formatDollar(raw: string): string {
  // Strip everything except digits and dots
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(".");
  const intPart = parts[0];
  const decPart = parts.length > 1 ? `.${parts[1].slice(0, 2)}` : "";

  // Add commas
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${withCommas}${decPart}`;
}

// Format a raw string into a number with commas: "1,234,567"
export function formatNumber(raw: string): string {
  const cleaned = raw.replace(/[^0-9]/g, "");
  if (!cleaned) return "";
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Parse a formatted dollar/number string back to a raw number string (for storage)
export function parseFormatted(formatted: string): string {
  return formatted.replace(/[$,]/g, "");
}
