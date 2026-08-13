export function hexToHslTriplet(hex: string): string {
  let cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return "";
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function luminanceForeground(hex: string): string {
  const triplet = hexToHslTriplet(hex);
  const lMatch = triplet.match(/(\d+)%$/);
  if (!lMatch) return "0 0% 100%";
  return parseInt(lMatch[1], 10) > 55 ? "222 47% 11%" : "0 0% 100%";
}

export function applyBrandingColors(primaryHex?: string | null, accentHex?: string | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (primaryHex) {
    const triplet = hexToHslTriplet(primaryHex);
    if (triplet) {
      root.style.setProperty("--primary", triplet);
      root.style.setProperty("--primary-foreground", luminanceForeground(primaryHex));
      root.style.setProperty("--sidebar-primary", triplet);
      root.style.setProperty("--sidebar-primary-foreground", luminanceForeground(primaryHex));
    }
  }
  if (accentHex) {
    const triplet = hexToHslTriplet(accentHex);
    if (triplet) {
      root.style.setProperty("--accent", triplet);
      root.style.setProperty("--ring", triplet);
      root.style.setProperty("--sidebar-accent", triplet);
      root.style.setProperty("--sidebar-ring", triplet);
    }
  }
}