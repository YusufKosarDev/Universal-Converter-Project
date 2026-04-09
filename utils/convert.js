export function convertUnit(fromRate, toRate, amount) {
  const baseValue = amount * fromRate;
  return baseValue / toRate;
}

export function formatNumber(num) {
  if (!Number.isFinite(num)) return "Geçersiz sonuç";

  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 8
  }).format(num);
}