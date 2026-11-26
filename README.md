# shw-ui-tokens

Shared design tokens for web, WeChat Mini Programs and native clients. The package resolves light and dark themes, renders CSS and WXSS variables, and exports a JSON subset for native resource generation.

## Install

The GitHub release includes a public npm tarball. Install it without npm or GitHub credentials:

```sh
npm install https://github.com/shyun-cc/shw-ui-tokens/releases/download/v0.33.1/shwkj-shw-ui-tokens-0.33.1.tgz
```

Use `resolveTheme(input, mode)` for runtime values. Import `@shwkj/shw-ui-tokens/default.css` for web defaults, use `default.wxss` in Mini Programs, or read the `tokens.json` export to generate native resources. The package also provides the `shw-ui-theme` command for generating theme files.

## Develop

Use Node.js 24 and pnpm 11.0.9.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

The build generates and compares the CSS, WXSS and native outputs and verifies the command-line interface. The distributable npm archive is generated with `npm pack` after the build.

## 鸣谢与第三方版权（Acknowledgments & Licenses）

- [Björn Ottosson’s Oklab reference implementation](https://bottosson.github.io/posts/oklab/) supplies the conversion formulas used in `src/color.ts`. The [original MIT notice](LICENSES/oklab.MIT.txt) is shipped with the package.
- The [Design Tokens Community Group Format Module](https://www.designtokens.org/tr/2025.10/format/) is a related specification published under the [W3C Community Final Specification Agreement](https://www.w3.org/community/about/agreements/final/). This library exports its own JSON schema along with CSS and WXSS.
- [TypeScript](https://github.com/microsoft/TypeScript) ([Apache-2.0](https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt)) compiles the library. [Node.js](https://nodejs.org/) ([MIT and bundled third-party notices](https://github.com/nodejs/node/blob/v24.x/LICENSE)) runs the generator and CLI. [pnpm](https://pnpm.io/) ([MIT](https://github.com/pnpm/pnpm/blob/main/LICENSE)) manages development dependencies.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the scope of the Oklab attribution.

## License

[MIT](LICENSE).
