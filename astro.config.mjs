// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// 公告網站產生靜態 HTML，供 Cloudflare Pages 使用。
export default defineConfig({
  output: 'static',

  vite: {
    plugins: [tailwindcss()]
  }
});