# 25th 北科資工系學會官方網站

國立臺北科技大學資訊工程系學會官方網站，提供系學會最新消息、活動文章、聯絡方式與社群平台資訊。

網站使用 Astro 與 Tailwind CSS 建置，部署於 Cloudflare Pages；最新消息以 Markdown 儲存。歡迎其他學生社團 Fork 本專案，依照自己的組織資訊修改使用。

- 正式網站：[https://ntutcsie.pages.dev/](https://ntutcsie.pages.dev/)
- 最新消息：[https://ntutcsie.pages.dev/news/](https://ntutcsie.pages.dev/news/)

## 網站功能

- 首頁顯示最新三篇消息
- `/news/` 依日期列出所有文章
- 每篇 Markdown 文章自動建立獨立頁面
- Google 表單聯絡入口
- Instagram 與 Facebook 社群連結

## 使用技術

- [Astro](https://astro.build/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

## 本機開發

需要 Node.js 22.12.0 以上版本，版本需求記錄在 `package.json`。

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

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `npm ci` | 安裝 lockfile 指定的套件 |
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建置正式網站 |
| `npm run preview` | 使用 Wrangler 預覽 Cloudflare Pages |
| `npm run generate-types` | 重新產生 Cloudflare Runtime 型別 |
| `npm run deploy` | 手動建置並部署至 Cloudflare Pages |

## 專案結構

```text
.
├── public/                              # 不經 Astro 處理的靜態檔案
│   └── favicon.svg                     # 網站圖示
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
│   └── env.d.ts                         # Astro 環境型別變數範例
├── astro.config.mjs                    # Astro 與 Tailwind 設定
├── LICENSE.md                          # 程式碼與內容的授權條款
├── package.json                        # 套件與 npm 指令
├── package-lock.json                   # 鎖定套件版本
├── tsconfig.json                       # TypeScript 設定
├── worker-configuration.d.ts           # Cloudflare Runtime 型別
└── wrangler.jsonc                      # Cloudflare Pages 設定
```

## 授權 / License

本專案採用混合授權，詳細內容請參閱 [授權條款](./LICENSE.md)。

This project uses mixed licensing. See the [license terms](./LICENSE.md) for details.
