# shw-ui-tokens

[English](./README.md) | 简体中文 | [繁體中文](./README.zh-TW.md)

为 Web、微信小程序和原生客户端提供共享设计令牌。此软件包可解析亮色和暗色主题，生成 CSS 与 WXSS 变量，并导出用于生成原生资源的 JSON 子集。

## 安装

GitHub Release 提供公开的 npm 压缩包，无需 npm 或 GitHub 凭据即可安装：

```sh
npm install https://github.com/shyun-cc/shw-ui-tokens/releases/download/v0.33.1/shwkj-shw-ui-tokens-0.33.1.tgz
```

使用 `resolveTheme(input, mode)` 获取运行时的值。Web 可导入 `@shwkj/shw-ui-tokens/default.css` 使用默认值，小程序可使用 `default.wxss`，原生端可读取导出的 `tokens.json` 以生成资源。软件包还提供 `shw-ui-theme` 命令来生成主题文件。

## 开发

使用 Node.js 24 和 pnpm 11.0.9。

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

构建过程会生成并对比 CSS、WXSS 和原生端产物，同时验证命令行工具。构建后可用 `npm pack` 生成可分发的 npm 压缩包。

## 鸣谢与第三方版权

- [Björn Ottosson 的 Oklab 参考实现](https://bottosson.github.io/posts/oklab/)提供了 `src/color.ts` 使用的转换公式。软件包附带[原始 MIT 声明](LICENSES/oklab.MIT.txt)。
- [Design Tokens Community Group 格式模块](https://www.designtokens.org/tr/2025.10/format/)是相关规范，按 [W3C Community Final Specification Agreement](https://www.w3.org/community/about/agreements/final/) 发布。本库导出自己的 JSON Schema，以及 CSS 和 WXSS。
- [TypeScript](https://github.com/microsoft/TypeScript)（[Apache-2.0](https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt)）用于编译。[Node.js](https://nodejs.org/)（[MIT 及随附的第三方声明](https://github.com/nodejs/node/blob/v24.x/LICENSE)）运行生成器和命令行工具。[pnpm](https://pnpm.io/)（[MIT](https://github.com/pnpm/pnpm/blob/main/LICENSE)）管理开发依赖。

Oklab 的署名范围见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 许可证

[MIT](LICENSE)。
