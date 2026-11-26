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

## License

[MIT](LICENSE).
