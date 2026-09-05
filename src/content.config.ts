import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 自動載入 src/content/news 內的所有 Markdown 文章。
const news = defineCollection({
	loader: glob({
		base: './src/content/news',
		pattern: '**/*.md',
	}),
	// 每篇文章的 frontmatter 都必須符合這個資料結構。
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
	}),
});

export const collections = { news };
