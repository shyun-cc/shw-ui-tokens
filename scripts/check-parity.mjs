// Check the files consumers load, including block selectors and the native subset.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTheme, SLOTS } from '../dist/index.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const read = file => readFileSync(file, 'utf8')
const asset = name => read(join(root, manifest.exports['./' + name]))
const selectors = {
  css: [':root', '[data-theme="dark"]'],
  wxss: ['page, .shw-popup, .shw-popup-overlay', '.shw-theme-dark'],
}

function declarations(source, expectedSelectors) {
  const blocks = {}
  let consumed = ''
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    consumed += match[0]
    const selector = match[1].trim()
    assert.ok(!Object.hasOwn(blocks, selector), 'duplicate block ' + selector)
    const vars = {}
    for (const line of match[2].trim().split('\n')) {
      const declaration = /^\s*--shw-([\w-]+):\s*(.+);\s*$/.exec(line)
      assert.ok(declaration, 'unexpected declaration: ' + line)
      const [, name, value] = declaration
      assert.ok(!Object.hasOwn(vars, name), 'duplicate slot ' + name)
      vars[name] = value
    }
    blocks[selector] = vars
  }
  assert.equal(consumed.trim(), source.trim())
  assert.deepEqual(Object.keys(blocks), expectedSelectors)
  return expectedSelectors.map(s => blocks[s])
}

function verifyPair(css, wxss, input) {
  const expected = ['light', 'dark'].map(mode => resolveTheme(input[mode], mode))
  const web = declarations(css, selectors.css)
  assert.deepEqual(web, expected)
  assert.deepEqual(declarations(wxss, selectors.wxss), web)
  return web
}

const defaults = { light: {}, dark: {} }
const [day, night] = verifyPair(asset('default.css'), asset('default.wxss'), defaults)
const json = JSON.parse(asset('tokens.json'))
assert.equal(json.schemaVersion, 1)
const expectedNative = {}
for (const { name } of SLOTS) {
  const values = [day[name], night[name]]
  let type, parsed
  if (values.every(v => /^#[a-f\d]{6}$/i.test(v))) {
    type = 'color'
    parsed = values
  } else if (values.every(v => /^-?\d+(?:\.\d+)?px$/.test(v))) {
    type = name.startsWith('font-size') ? 'fontSize' : 'dimension'
    parsed = values.map(parseFloat)
  } else if (name.startsWith('font-weight-')) {
    type = 'fontWeight'
    parsed = values.map(Number)
    assert.ok(parsed.every(v => Number.isInteger(v) && v >= 1 && v <= 1000))
  } else continue
  expectedNative[name] = { type, light: parsed[0], dark: parsed[1] }
}
assert.deepEqual(json.tokens, expectedNative)

const temp = mkdtempSync(join(tmpdir(), 'shw-theme-parity-'))
try {
  for (const bin of ['shw-ui-theme', 'shw-mui-theme']) {
    for (const input of [defaults, { light: { primary: '#123456' }, dark: { overrides: { surface: '#283344' } } }]) {
      const file = join(temp, 'input.json')
      writeFileSync(file, JSON.stringify(input))
      const out = mkdtempSync(join(temp, 'output-'))
      execFileSync(process.execPath, [join(root, manifest.bin[bin]), 'build', '--input', file, '--out', out])
      verifyPair(read(join(out, 'theme.css')), read(join(out, 'theme.wxss')), input)
    }
  }
} finally { rmSync(temp, { recursive: true, force: true }) }
console.log('Verified both modes, ' + Object.keys(day).length + ' CSS/WXSS declarations, ' + Object.keys(json.tokens).length + ' native tokens and both CLI aliases.')
