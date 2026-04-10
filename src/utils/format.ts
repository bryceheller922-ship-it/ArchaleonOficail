// Format a number string with dollar sign and commas as the user types
export function formatDollar(raw: string): string {
  // Remove everything except digits
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Add commas to digits
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "$" + withCommas;
}

// Format a number string with commas (no dollar sign)
export function formatNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Strip formatting to get raw number string for storage/parsing
export function parseFormatted(formatted: string): string {
  return formatted.replace(/[^0-9.]/g, "");
}
