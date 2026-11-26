// 在 tokens 包构建后运行，输出项目文档 shw-ui-tokens-slots 的表格章节。
import { DEFAULT_THEME, SLOTS, resolveTheme } from '../dist/index.js'

const light = resolveTheme({}, 'light')
const dark = resolveTheme({}, 'dark')

function tableText(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '\\|')
}

const lines = [
  '## 基础层默认值',
  '',
  '| 输入 | 亮色 | 暗色 |',
  '| --- | --- | --- |',
]
for (const [name, value] of Object.entries(DEFAULT_THEME.light)) {
  lines.push(`| \`${name}\` | \`${value}\` | \`${DEFAULT_THEME.dark[name]}\` |`)
}

for (const group of new Set(SLOTS.map((slot) => slot.group))) {
  lines.push('', `## ${group}`, '', '| 插槽 | 层 | 用途 | 推导规则 | 默认亮色 | 默认暗色 |', '| --- | --- | --- | --- | --- | --- |')
  for (const slot of SLOTS.filter((slot) => slot.group === group)) {
    const layer = slot.layer === 'base' ? '基础' : '推导'
    lines.push(`| \`${slot.name}\` | ${layer} | ${tableText(slot.usage)} | ${tableText(slot.rule)} | \`${light[slot.name]}\` | \`${dark[slot.name]}\` |`)
  }
}
console.log(lines.join('\n'))
