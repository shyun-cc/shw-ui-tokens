import { SLOTS, type BaseTheme, type Mode, type ThemeInput } from './slots.js'

/**
 * 默认主题：组件库唯一的标准外观，即旧版 classic 外观配套的标准主题（#315）。
 * 基础层沿用该项目的输入；其余固定取值见 STANDARD，项目改写对应基础值时自动让位于推导结果。
 */
export const DEFAULT_THEME: Record<Mode, BaseTheme> = {
  light: {
    info: '#1f5fd6', primary: '#FF6600', success: '#1e9e61', warning: '#e8940c', error: '#e5484d',
    neutral: '#5b6475', radius: 8, fontSize: 14, space: 4, shadowColor: '#1b2a4a',
  },
  dark: {
    info: '#4c86f0', primary: '#FF6600', success: '#4CAF50', warning: '#FF9800', error: '#F44336',
    neutral: '#666666', radius: 8, fontSize: 14, space: 4, shadowColor: '#000000',
  },
}

/** 标准外观的固定插槽：按依赖的基础值分组，项目填写了该基础值时整组不再生效。 */
const STANDARD: Record<Mode, { when?: keyof BaseTheme; vars: Record<string, string> }[]> = {
  light: [
    { when: 'primary', vars: { 'primary-disabled': '#FFAD8A', 'text-on-primary': '#FFFFFF', 'primary-light': '#FFF3EB', 'primary-active': '#E65C00' } },
    {
      when: 'neutral',
      vars: {
        'text-primary': '#101010', 'text-secondary': '#333333', 'text-hint': '#999999', 'text-disabled': '#C0C0C0',
        border: '#EFEFEF', divider: '#EFEFEF', bg: '#F8F8F8', 'bg-secondary': '#F5F5F5', 'bg-tertiary': '#EBEBEB', 'bg-disabled': '#F5F5F5',
        'field-bg': '#FFFFFF', 'overlay-bg': 'rgba(0, 0, 0, 0.7)', 'input-placeholder-color': '#808080', 'input-disabled-placeholder-color': '#808080',
      },
    },
    { when: 'success', vars: { success: '#4CAF50' } },
    { when: 'warning', vars: { warning: '#FF9800' } },
    { when: 'error', vars: { error: '#F44336' } },
    { when: 'radius', vars: { radius: '10px', 'radius-sm': '4px' } },
    {
      when: 'shadowColor',
      vars: { shadow: '0 1px 6px rgba(0, 0, 0, 0.04)', 'shadow-elevated': '0 1px 6px rgba(0, 0, 0, 0.04)', 'field-shadow': '0 1px 6px rgba(0, 0, 0, 0.04)' },
    },
    { vars: { 'nav-bar-arrow-bg': 'rgba(0, 0, 0, 0.25)', 'nav-bar-arrow-color': '#FFFFFF', 'button-disabled-blend-text': 'rgba(255, 255, 255, 0.6)' } },
    { vars: { ...componentStandard(), 'more-menu-bg': 'var(--shw-bg)' } },
  ],
  dark: [
    { when: 'neutral', vars: { 'input-placeholder-color': '#8b8b8b', 'input-disabled-placeholder-color': '#8b8b8b' } },
    { when: 'radius', vars: { radius: '10px', 'radius-sm': '4px' } },
    {
      when: 'shadowColor',
      vars: { shadow: '0 1px 6px rgba(0, 0, 0, 0.04)', 'shadow-elevated': '0 1px 6px rgba(0, 0, 0, 0.04)', 'field-shadow': '0 1px 6px rgba(0, 0, 0, 0.04)' },
    },
    { vars: { 'nav-bar-arrow-bg': 'rgba(0, 0, 0, 0.25)', 'nav-bar-arrow-color': '#ffffff', 'button-disabled-blend-text': 'rgba(255, 255, 255, 0.6)' } },
    { vars: { ...componentStandard(), 'more-menu-bg': 'var(--shw-surface)' } },
  ],
}

/** 与颜色无关的组件层标准取值（两种模式相同）。 */
function componentStandard(): Record<string, string> {
  return {
    'nav-bar-height': '46px', 'nav-bar-arrow-round-size': '28px', 'nav-bar-arrow-size': '15px',
    'field-radius': '8px', 'picker-height': '40px', 'picker-label-font-size': '14px', 'picker-label-line-height': '20px',
    'picker-disabled-opacity': '1', 'picker-disabled-bg': 'var(--shw-bg-disabled)', 'picker-disabled-color': 'var(--shw-text-disabled)',
    'input-height': '1.4rem', 'input-card-padding-y': '10px', 'input-line-height': '24px', 'input-icon-size': '16px',
    'popup-radius': '10px', 'popup-font-family': '"PingFang SC"', 'popup-line-height': 'normal', 'popup-font-smoothing': 'auto',
    'button-font-weight': 'normal', 'button-font-smoothing': 'auto',
    'range-calendar-part-flex': '1', 'range-calendar-gap': '0', 'range-calendar-sep-padding': '0 8px',
  }
}

function standardOverrides(input: ThemeInput, mode: Mode): Record<string, string> {
  const out: Record<string, string> = {}
  for (const group of STANDARD[mode]) if (!group.when || input[group.when] === undefined) Object.assign(out, group.vars)
  return out
}

/** 插槽名 → 值（不含 `--shw-` 前缀），按插槽清单顺序。 */
export type ThemeVars = Record<string, string>

const KNOWN = new Set(SLOTS.map((s) => s.name))

/** 由基础层（未填取默认主题）推导全部插槽，再应用 overrides。构建时与运行时共用。 */
export function resolveTheme(input: ThemeInput = {}, mode: Mode = 'light'): ThemeVars {
  const { overrides: own = {}, ...partial } = input
  const base: BaseTheme = { ...DEFAULT_THEME[mode], ...stripUndefined(partial) }
  const overrides = { ...standardOverrides(input, mode), ...own }
  for (const key of Object.keys(own)) {
    if (!KNOWN.has(key) && !key.includes('-')) throw new Error(`未知插槽：${key}`)
  }
  const vars: ThemeVars = {}
  for (const slot of SLOTS) {
    vars[slot.name] = overrides[slot.name] ?? slot.compute(base, mode, vars)
  }
  // 组件层插槽（名称不在清单中，如 nav-bar-bg）原样追加
  for (const [k, v] of Object.entries(overrides)) if (!KNOWN.has(k)) vars[k] = v
  return vars
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>
}

function declarations(vars: ThemeVars, indent = '  '): string {
  return Object.entries(vars)
    .map(([k, v]) => {
      if (!/^[a-z0-9-]+$/.test(k)) throw new Error(`非法插槽名：${k}`)
      return `${indent}--shw-${k}: ${v};`
    })
    .join('\n')
}

/** 内联 style 字符串（运行时换肤：H5 元素 style / 微信页面根节点 style）。 */
export function toCssText(vars: ThemeVars): string {
  return Object.entries(vars).map(([k, v]) => `--shw-${k}: ${v}`).join('; ')
}

export function renderBlock(selector: string, vars: ThemeVars): string {
  return `${selector} {\n${declarations(vars)}\n}\n`
}

export interface ThemeFile { light?: ThemeInput; dark?: ThemeInput }

/** H5：亮色挂 :root，暗色挂 [data-theme="dark"]。 */
export function renderCss(file: ThemeFile): string {
  let out = renderBlock(':root', resolveTheme(file.light, 'light'))
  if (file.dark) out += `\n${renderBlock('[data-theme="dark"]', resolveTheme(file.dark, 'dark'))}`
  return out
}

/** 微信：root-portal 子树不继承 page，亮色也挂到弹层与遮罩根节点；动态主题由 Popup.portalStyle 覆盖。 */
export function renderWxss(file: ThemeFile): string {
  let out = renderBlock('page, .shw-popup, .shw-popup-overlay', resolveTheme(file.light, 'light'))
  if (file.dark) out += `\n${renderBlock('.shw-theme-dark', resolveTheme(file.dark, 'dark'))}`
  return out
}
