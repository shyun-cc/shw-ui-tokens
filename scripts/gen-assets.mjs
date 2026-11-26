import { writeFileSync } from 'node:fs'
import { SLOTS, resolveTheme, renderCss, renderWxss } from '../dist/index.js'

const theme = { light: {}, dark: {} }
writeFileSync(new URL('../dist/default.css', import.meta.url), renderCss(theme))
writeFileSync(new URL('../dist/default.wxss', import.meta.url), renderWxss(theme))

// 原生首期只导出有跨端语义的颜色、字号、字重和逻辑尺寸。
const light = resolveTheme({}, 'light')
const dark = resolveTheme({}, 'dark')
const tokens = {}
for (const { name } of SLOTS) {
  const value = light[name]
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    tokens[name] = { type: 'color', light: value, dark: dark[name] }
  } else if (/^-?[\d.]+px$/.test(value)) {
    const type = name.startsWith('font-size') ? 'fontSize' : 'dimension'
    tokens[name] = { type, light: parseFloat(value), dark: parseFloat(dark[name]) }
  } else if (name.startsWith('font-weight-')) {
    tokens[name] = { type: 'fontWeight', light: Number(value), dark: Number(dark[name]) }
  }
}
writeFileSync(new URL('../dist/tokens.json', import.meta.url), JSON.stringify({ schemaVersion: 1, tokens }, null, 2) + '\n')
