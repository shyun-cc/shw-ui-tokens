// shw-mui-theme build --input theme.json --out <dir>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderCss, renderWxss, type ThemeFile } from './theme.js'

const args = process.argv.slice(2)
const opt = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
if (args[0] !== 'build') {
  console.error('用法：shw-mui-theme build --input theme.json --out <目录>')
  process.exit(2)
}
const input = opt('--input')
const out = opt('--out') ?? '.'
const file: ThemeFile = input ? JSON.parse(readFileSync(input, 'utf8')) : {}
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'theme.css'), renderCss(file))
writeFileSync(join(out, 'theme.wxss'), renderWxss(file))
console.log(`已生成 ${join(out, 'theme.css')} 与 ${join(out, 'theme.wxss')}`)
