// sRGB <-> OKLCH 转换（Björn Ottosson, OKLab）。只处理不透明 #rrggbb。
export interface Oklch { l: number; c: number; h: number }

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

export function parseHex(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) throw new Error(`非法颜色（仅支持 #rgb / #rrggbb）：${hex}`)
  const s = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255) as [number, number, number]
}

export function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('')}`
}

function rgbToOklab([r, g, b]: [number, number, number]): [number, number, number] {
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToLinear([L, a, b]: [number, number, number]): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function hexToOklch(hex: string): Oklch {
  const [L, a, b] = rgbToOklab(parseHex(hex))
  return { l: L, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 }
}

/** OKLCH → hex；超出 sRGB 色域时降低彩度直到落入色域。 */
export function oklchToHex({ l, c, h }: Oklch): string {
  const L = clamp01(l)
  const rad = (h * Math.PI) / 180
  let chroma = Math.max(0, c)
  for (let i = 0; i < 40; i++) {
    const lin = oklabToLinear([L, chroma * Math.cos(rad), chroma * Math.sin(rad)])
    if (lin.every((v) => v >= -1e-4 && v <= 1 + 1e-4) || chroma < 1e-4) {
      return toHex(lin.map(fromLinear) as [number, number, number])
    }
    chroma *= 0.92
  }
  return toHex(oklabToLinear([L, 0, 0]).map(fromLinear) as [number, number, number])
}

/** 在 OKLab 中按比例 t 从 a 混合到 b。 */
export function mix(a: string, b: string, t: number): string {
  const [la, aa, ba] = rgbToOklab(parseHex(a))
  const [lb, ab, bb] = rgbToOklab(parseHex(b))
  const lab: [number, number, number] = [la + (lb - la) * t, aa + (ab - aa) * t, ba + (bb - ba) * t]
  return toHex(oklabToLinear(lab).map(fromLinear) as [number, number, number])
}

function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 对比度。 */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex).map((v) => Math.round(v * 255))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
