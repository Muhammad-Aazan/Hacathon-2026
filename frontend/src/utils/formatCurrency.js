export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
