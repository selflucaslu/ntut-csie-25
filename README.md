# 25th 北科資工系學會官方網站

國立臺北科技大學資訊工程系學會官方網站，提供系學會最新消息、活動文章、聯絡方式與社群平台資訊。

網站使用 Astro 與 Tailwind CSS 建置，部署於 Cloudflare Pages；最新消息以 Markdown 儲存，也可以透過 Decap CMS 後台編輯。歡迎其他學生社團 Fork 本專案，依照自己的組織資訊修改使用。

- 正式網站：[https://ntutcsie.pages.dev/](https://ntutcsie.pages.dev/)
- 最新消息：[https://ntutcsie.pages.dev/news/](https://ntutcsie.pages.dev/news/)
- 內容管理後台：[https://ntutcsie.pages.dev/admin/](https://ntutcsie.pages.dev/admin/)

## 網站功能

- 首頁顯示最新三篇消息
- `/news/` 依日期列出所有文章
- 每篇 Markdown 文章自動建立獨立頁面
- Google 表單聯絡入口
- Instagram 與 Facebook 社群連結
- Decap CMS 文章管理後台
- GitHub OAuth 管理員登入

## 使用技術

- [Astro](https://astro.build/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Decap CMS](https://decapcms.org/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)

## 本機開發

需要 Node.js 22.19.0 以上版本，版本需求記錄在 `.node-version` 與 `package.json`。

```bash
npm ci
npm run dev
```

開發伺服器預設位於：

```text
http://localhost:4321/
```

正式建置：

```bash
npm run build
```

輸出檔案會放在 `dist/`。

## 新增最新消息

文章放在 `src/content/news/`，每一篇都是 Markdown 檔案：

```markdown
---
title: 文章標題
description: 顯示在首頁與 NEWS 列表的簡短說明。
pubDate: 2026-09-06
---

這裡撰寫文章內容。
```

檔名會成為文章網址，例如：

```text
src/content/news/department-open-house.md
→ /news/department-open-house/
```

文章欄位的資料結構定義在 `src/content.config.ts`。

## Decap CMS 設定

CMS 的常用設定集中在專案根目錄的 `cms.config.mjs`。Fork 後主要修改以下項目即可：

| 設定 | 用途 |
| --- | --- |
| `siteName` | 網站與 CMS 顯示名稱 |
| `siteUrl` | 正式網站網址 |
| `repository` | CMS 寫入的 GitHub Repository |
| `branch` | Cloudflare 部署的正式分支 |
| `repositoryPrivate` | Repository 是否為私人 |

修改完成後執行：

```bash
npm run generate:cms
```

系統會自動產生 `public/admin/index.html` 和 `public/admin/config.yml`。請勿直接修改這兩個檔案；`npm run dev` 與 `npm run build` 也會自動重新產生它們。

CMS 發布流程：

```text
管理員進入 /admin/
→ 使用 GitHub OAuth 登入
→ 在 Decap CMS 新增或修改文章
→ CMS 將 Markdown commit 到 GitHub
→ Cloudflare Pages 自動重新建置網站
```

只有具備 GitHub Repository 寫入權限的帳號可以發布內容。

### 正式環境登入設定

在 [GitHub Developer Settings](https://github.com/settings/developers) 建立 OAuth App：

```text
Homepage URL:
https://你的網域/admin/

Authorization callback URL:
https://你的網域/callback
```

接著在 Cloudflare Pages 的 Production Variables and Secrets 加入：

| 名稱 | 類型 | 內容 |
| --- | --- | --- |
| `GITHUB_OAUTH_ID` | Secret | GitHub OAuth Client ID |
| `GITHUB_OAUTH_SECRET` | Secret | GitHub OAuth Client Secret |

Secret 不可寫入程式碼。儲存變數並重新部署後，即可從 `/admin/` 登入；若顯示 `OAuth is not configured.`，請檢查這兩個 Production 變數是否已設定。

### 本機測試 CMS

分別執行 `npx decap-server` 與 `npm run dev`，再開啟 `http://localhost:4321/admin/`。本機測試使用 Decap Proxy，不需要 OAuth Secret。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `npm ci` | 安裝 lockfile 指定的套件 |
| `npm run dev` | 產生 CMS 設定並啟動開發伺服器 |
| `npm run build` | 產生 CMS 設定並建置正式網站 |
| `npm run generate:cms` | 手動重新產生 CMS 檔案 |
| `npm run preview` | 使用 Wrangler 預覽 Cloudflare Pages |
| `npm run deploy` | 手動建置並部署至 Cloudflare Pages |

## 專案結構

```text
.
├── functions/                          # Cloudflare Pages Functions
│   ├── auth.ts                         # 導向 GitHub OAuth 登入頁面
│   └── callback.ts                     # 接收 OAuth callback 並交換 token
├── public/                              # 不經 Astro 處理的靜態檔案
│   ├── admin/
│   │   ├── index.html                  # 自動產生的 Decap CMS 入口
│   │   └── config.yml                  # 自動產生的 Decap CMS 設定
│   ├── _headers                        # 管理頁面的安全性 HTTP Headers
│   ├── _routes.json                    # 限定 Pages Functions 執行路徑
│   └── favicon.svg                     # 網站圖示
├── scripts/
│   └── generate-cms-config.mjs         # 根據共用設定產生 CMS 檔案
├── src/
│   ├── components/                     # 可重複使用的 Astro 元件
│   │   ├── FlowBackground.astro        # 首頁流動背景動畫
│   │   ├── NewsRow.astro               # 最新消息列表中的單篇項目
│   │   ├── SiteFooter.astro            # 全站頁尾
│   │   ├── SiteHeader.astro            # 全站導覽列與 Logo
│   │   └── SocialLinks.astro           # Instagram 與 Facebook 連結
│   ├── content/
│   │   └── news/                       # 最新消息 Markdown 文章
│   │       ├── department-open-house.md
│   │       └── welcome.md
│   ├── layouts/
│   │   └── Layout.astro                # 共用 HTML、SEO、Header 與 Footer
│   ├── lib/
│   │   └── date.ts                     # 統一日期顯示格式
│   ├── pages/                           # Astro 檔案式路由
│   │   ├── index.astro                 # 首頁：介紹、最新消息與聯絡資訊
│   │   └── news/
│   │       ├── index.astro             # /news/：全部最新消息
│   │       └── [slug]/
│   │           └── index.astro         # /news/:slug/：單篇文章
│   ├── styles/
│   │   └── global.css                  # Tailwind 與少量全域樣式
│   ├── content.config.ts               # News Content Collection Schema
│   └── env.d.ts                         # Astro 環境型別
├── .dev.vars.example                   # 本機 OAuth 環境變數範例
├── .node-version                       # 專案使用的 Node.js 版本
├── astro.config.mjs                    # Astro 與 Tailwind 設定
├── cms.config.mjs                      # CMS 共用設定來源
├── package.json                        # 套件與 npm 指令
├── package-lock.json                   # 鎖定套件版本
├── tsconfig.json                       # TypeScript 設定
├── worker-configuration.d.ts           # Cloudflare Runtime 型別
└── wrangler.jsonc                      # Cloudflare Pages 設定
```

## 安全性

- GitHub OAuth Secret 只能存放在 Cloudflare Secrets。
- 管理員應啟用 GitHub 兩步驟驗證。
- 系學會成員交接或離任時，應同步調整 Repository 權限。
- `/admin/` 網址可以公開，但沒有 Repository 權限的使用者無法發布文章。
