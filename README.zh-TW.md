# shw-ui-tokens

[English](./README.md) | [简体中文](./README.zh-CN.md) | 繁體中文

為 Web、微信小程式和原生用戶端提供共享設計權杖。此套件可解析亮色和暗色主題，產生 CSS 與 WXSS 變數，並匯出用於產生原生資源的 JSON 子集。

## 安裝

GitHub Release 提供公開的 npm 壓縮檔，無需 npm 或 GitHub 憑據即可安裝：

```sh
npm install https://github.com/shyun-cc/shw-ui-tokens/releases/download/v0.33.1/shwkj-shw-ui-tokens-0.33.1.tgz
```

使用 `resolveTheme(input, mode)` 獲取執行階段的值。Web 可匯入 `@shwkj/shw-ui-tokens/default.css` 使用預設值，小程式可使用 `default.wxss`，原生端可讀取匯出的 `tokens.json` 以產生資源。套件還提供 `shw-ui-theme` 命令來產生主題檔案。

## 開發

使用 Node.js 24 和 pnpm 11.0.9。

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

建置過程會產生並對比 CSS、WXSS 和原生端產物，同時驗證命令列工具。建置後可用 `npm pack` 產生可散布的 npm 壓縮檔。

## 鳴謝與第三方版權

- [Björn Ottosson 的 Oklab 參考實現](https://bottosson.github.io/posts/oklab/)提供了 `src/color.ts` 使用的轉換公式。套件附帶[原始 MIT 宣告](LICENSES/oklab.MIT.txt)。
- [Design Tokens Community Group 格式模組](https://www.designtokens.org/tr/2025.10/format/)是相關規範，按 [W3C Community Final Specification Agreement](https://www.w3.org/community/about/agreements/final/) 釋出。本庫匯出自己的 JSON Schema，以及 CSS 和 WXSS。
- [TypeScript](https://github.com/microsoft/TypeScript)（[Apache-2.0](https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt)）用於編譯。[Node.js](https://nodejs.org/)（[MIT 及隨附的第三方宣告](https://github.com/nodejs/node/blob/v24.x/LICENSE)）執行產生器和命令列工具。[pnpm](https://pnpm.io/)（[MIT](https://github.com/pnpm/pnpm/blob/main/LICENSE)）管理開發相依。

Oklab 的署名範圍見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 許可證

[MIT](LICENSE)。
