import { contrast, hexToOklch, mix, oklchToHex, rgba } from './color.js'

export type Mode = 'light' | 'dark'

/** 基础层：业务项目填写的输入。颜色为 #rrggbb，尺寸为 px 数值。 */
export interface BaseTheme {
  primary: string
  info?: string
  success: string
  warning: string
  error: string
  /** 中性色：决定文字、边框、背景的色相与冷暖 */
  neutral: string
  /** 圆角基准（px） */
  radius: number
  /** 正文字号基准（px） */
  fontSize: number
  /** 间距基准（px） */
  space: number
  /** 阴影颜色 */
  shadowColor: string
}

export interface ThemeInput extends Partial<BaseTheme> {
  /** 推导层/组件层逐个覆盖，键为不带 `--shw-` 的插槽名 */
  overrides?: Record<string, string>
}

export type Layer = 'base' | 'derived'
export interface SlotDef {
  name: string
  layer: Layer
  group: string
  usage: string
  rule: string
  compute: (b: BaseTheme, mode: Mode, v: Record<string, string>) => string
}

const px = (n: number) => `${Math.round(n)}px`
const shiftL = (hex: string, dl: number) => {
  const c = hexToOklch(hex)
  return oklchToHex({ ...c, l: c.l + dl })
}
const setLC = (hex: string, l: number, cf: number) => {
  const c = hexToOklch(hex)
  return oklchToHex({ l, c: c.c * cf, h: c.h })
}
/** 中性色阶：取中性色色相、彩度 ×0.35，按目标明度生成。 */
const neutralAt = (b: BaseTheme, l: number) => setLC(b.neutral, l, 0.35)

const NEUTRAL_L: Record<string, [number, number, string]> = {
  //            亮色  暗色  用途
  'text-primary': [0.24, 0.95, '标题、正文主文字'],
  'text-secondary': [0.42, 0.8, '次要文字、说明'],
  'text-hint': [0.62, 0.62, '占位符、辅助提示'],
  'text-disabled': [0.8, 0.44, '禁用态文字'],
  border: [0.92, 0.33, '输入框、卡片、分割描边'],
  divider: [0.95, 0.28, '列表分割线'],
  bg: [0.975, 0.15, '页面背景'],
  'bg-secondary': [0.96, 0.2, '次级区块背景（分组、输入底）'],
  'bg-tertiary': [0.93, 0.3, '三级背景（标签底、按下态中性底；暗色须亮于 surface-elevated）'],
  'bg-disabled': [0.95, 0.26, '禁用控件背景'],
  'field-bg': [0.96, 0.24, '输入控件填充底（输入框、选择器触发器、搜索栏）'],
  surface: [1, 0.21, '卡片、弹层、导航栏等承载面'],
  'surface-elevated': [1, 0.25, '浮起的承载面（弹窗、下拉）'],
}

function brandSlots(key: 'info' | 'primary' | 'success' | 'warning' | 'error', label: string): SlotDef[] {
  return [
    {
      name: key, layer: 'base', group: '品牌与状态色', usage: `${label}：按钮、选中态、强调文字等`,
      rule: '项目填写', compute: (b) => (b[key] ?? b.primary),
    },
    {
      name: `${key}-active`, layer: 'derived', group: '品牌与状态色', usage: `${label}按下/激活态`,
      rule: 'OKLCH 明度：亮色 −0.08，暗色 +0.06',
      compute: (b, m) => shiftL((b[key] ?? b.primary), m === 'light' ? -0.08 : 0.06),
    },
    {
      name: `${key}-light`, layer: 'derived', group: '品牌与状态色', usage: `${label}浅底：标签底、选中项底色、提示条`,
      rule: '亮色：明度 0.95、彩度 ×0.25；暗色：明度 0.28、彩度 ×0.4',
      compute: (b, m) => (m === 'light' ? setLC((b[key] ?? b.primary), 0.95, 0.25) : setLC((b[key] ?? b.primary), 0.28, 0.4)),
    },
    {
      name: `${key}-border`, layer: 'derived', group: '品牌与状态色', usage: `${label}描边：朴素按钮、选中边框`,
      rule: '亮色：明度 0.84、彩度 ×0.6；暗色：明度 0.42、彩度 ×0.6',
      compute: (b, m) => (m === 'light' ? setLC((b[key] ?? b.primary), 0.84, 0.6) : setLC((b[key] ?? b.primary), 0.42, 0.6)),
    },
    {
      name: `${key}-disabled`, layer: 'derived', group: '品牌与状态色', usage: `${label}禁用态`,
      rule: '在 OKLab 中与 surface 按 55% 混合',
      compute: (b, _m, v) => mix((b[key] ?? b.primary), v.surface, 0.55),
    },
    {
      name: `text-on-${key}`, layer: 'derived', group: '品牌与状态色', usage: `${label}实底上的文字/图标`,
      rule: '默认白色；白色对比度低于 2:1（底色过浅，如亮黄）时改用 #1a1a1a',
      compute: (b) => (contrast((b[key] ?? b.primary), '#ffffff') >= 2 ? '#ffffff' : '#1a1a1a'),
    },
  ]
}

/** 插槽清单（顺序即计算顺序：被引用者在前）。项目文档 shw-ui-tokens-slots 的表格使用此清单导出。 */
export const SLOTS: SlotDef[] = [
  { name: 'neutral', layer: 'base', group: '中性色', usage: '中性色基准（不直接用于组件）', rule: '项目填写', compute: (b) => b.neutral },
  ...Object.entries(NEUTRAL_L).map(([name, [ll, dl, usage]]): SlotDef => ({
    name, layer: 'derived', group: '中性色', usage,
    rule: `中性色色相，彩度 ×0.35；明度 亮色 ${ll} / 暗色 ${dl}`,
    compute: (b, m) => neutralAt(b, m === 'light' ? ll : dl),
  })),
  {
    name: 'overlay-bg', layer: 'derived', group: '中性色', usage: '遮罩层背景',
    rule: '黑色，不透明度 亮色 0.6 / 暗色 0.7', compute: (_b, m) => rgba('#000000', m === 'light' ? 0.6 : 0.7),
  },
  ...brandSlots('primary', '主色'),
  ...brandSlots('info', '信息色'),
  ...brandSlots('success', '成功色'),
  ...brandSlots('warning', '警告色'),
  ...brandSlots('error', '危险/错误色'),
  { name: 'radius', layer: 'base', group: '圆角', usage: '卡片、弹层、输入框等默认圆角', rule: '项目填写', compute: (b) => px(b.radius) },
  { name: 'radius-sm', layer: 'derived', group: '圆角', usage: '小元素：标签、角标、小按钮', rule: 'radius × 0.4，取整', compute: (b) => px(b.radius * 0.4) },
  { name: 'radius-lg', layer: 'derived', group: '圆角', usage: '大面积：底部弹层顶部、对话框', rule: 'radius × 1.6，取整', compute: (b) => px(b.radius * 1.6) },
  { name: 'radius-round', layer: 'derived', group: '圆角', usage: '胶囊/圆形', rule: '固定 999px', compute: () => '999px' },
  { name: 'font-size', layer: 'base', group: '字体', usage: '正文字号', rule: '项目填写', compute: (b) => px(b.fontSize) },
  { name: 'font-size-xs', layer: 'derived', group: '字体', usage: '角标、极小说明', rule: 'font-size − 4', compute: (b) => px(b.fontSize - 4) },
  { name: 'font-size-sm', layer: 'derived', group: '字体', usage: '辅助文字、标签', rule: 'font-size − 2', compute: (b) => px(b.fontSize - 2) },
  { name: 'font-size-md', layer: 'derived', group: '字体', usage: '与正文相同（组件内正文）', rule: '= font-size', compute: (b) => px(b.fontSize) },
  { name: 'font-size-lg', layer: 'derived', group: '字体', usage: '导航栏标题、区块标题', rule: 'font-size + 2', compute: (b) => px(b.fontSize + 2) },
  { name: 'font-size-xl', layer: 'derived', group: '字体', usage: '弹窗标题', rule: 'font-size + 4', compute: (b) => px(b.fontSize + 4) },
  { name: 'font-size-xxl', layer: 'derived', group: '字体', usage: '数字强调、页面大标题', rule: 'font-size + 10', compute: (b) => px(b.fontSize + 10) },
  { name: 'font-weight-regular', layer: 'derived', group: '字体', usage: '正文字重', rule: '固定 400（可覆盖）', compute: () => '400' },
  { name: 'font-weight-medium', layer: 'derived', group: '字体', usage: '按钮、强调文字', rule: '固定 500（可覆盖）', compute: () => '500' },
  { name: 'font-weight-bold', layer: 'derived', group: '字体', usage: '标题', rule: '固定 600（可覆盖）', compute: () => '600' },
  { name: 'space', layer: 'base', group: '间距', usage: '间距基准单位', rule: '项目填写', compute: (b) => px(b.space) },
  { name: 'space-xxs', layer: 'derived', group: '间距', usage: '图标与文字间隙', rule: 'space × 0.5', compute: (b) => px(b.space * 0.5) },
  { name: 'space-xs', layer: 'derived', group: '间距', usage: '紧凑元素间距', rule: 'space × 1', compute: (b) => px(b.space) },
  { name: 'space-sm', layer: 'derived', group: '间距', usage: '组件内部小间距', rule: 'space × 2', compute: (b) => px(b.space * 2) },
  { name: 'space-md', layer: 'derived', group: '间距', usage: '组件内边距、列表行垂直内边距', rule: 'space × 3', compute: (b) => px(b.space * 3) },
  { name: 'space-lg', layer: 'derived', group: '间距', usage: '页面左右边距、区块内边距', rule: 'space × 4', compute: (b) => px(b.space * 4) },
  { name: 'space-xl', layer: 'derived', group: '间距', usage: '区块之间', rule: 'space × 6', compute: (b) => px(b.space * 6) },
  { name: 'control-height-xs', layer: 'derived', group: '控件尺寸', usage: '迷你按钮等最小控件高度', rule: 'space × 6', compute: (b) => px(b.space * 6) },
  { name: 'control-height-sm', layer: 'derived', group: '控件尺寸', usage: '小号控件高度', rule: 'space × 8', compute: (b) => px(b.space * 8) },
  { name: 'control-height-md', layer: 'derived', group: '控件尺寸', usage: '默认控件高度（按钮、输入行、导航栏）', rule: 'space × 11', compute: (b) => px(b.space * 11) },
  { name: 'control-height-lg', layer: 'derived', group: '控件尺寸', usage: '大号控件高度（底部主按钮）', rule: 'space × 12.5', compute: (b) => px(b.space * 12.5) },
  { name: 'tabbar-icon-default-size', layer: 'derived', group: '控件尺寸', usage: 'TabBar 原生图标位默认宽高', rule: 'control-height-lg × 0.54', compute: (b) => px(b.space * 12.5 * 0.54) },
  { name: 'loading-size', layer: 'derived', group: '控件尺寸', usage: 'Loading 默认图标尺寸', rule: 'space × 7.5', compute: (b) => px(b.space * 7.5) },
  { name: 'shadow-color', layer: 'base', group: '阴影', usage: '阴影颜色基准（不直接用于组件）', rule: '项目填写', compute: (b) => b.shadowColor },
  {
    name: 'shadow', layer: 'derived', group: '阴影', usage: '卡片等轻微浮起',
    rule: '0 1px 6px，shadow-color 不透明度 亮色 0.06 / 暗色 0.3',
    compute: (b, m) => `0 1px 6px ${rgba(b.shadowColor, m === 'light' ? 0.06 : 0.3)}`,
  },
  {
    name: 'shadow-elevated', layer: 'derived', group: '阴影', usage: '弹窗、下拉、悬浮按钮',
    rule: '0 4px 16px，shadow-color 不透明度 亮色 0.12 / 暗色 0.5',
    compute: (b, m) => `0 4px 16px ${rgba(b.shadowColor, m === 'light' ? 0.12 : 0.5)}`,
  },
]
