import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import cms from '../cms.config.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const adminDirectory = fileURLToPath(new URL('../public/admin/', import.meta.url));

function yamlString(value) {
	return JSON.stringify(String(value));
}

function validateConfig() {
	const siteUrl = new URL(cms.siteUrl);
	if (siteUrl.protocol !== 'https:' || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
		throw new Error('cms.config.mjs 的 siteUrl 必須是沒有路徑、查詢參數或錨點的 HTTPS 網址。');
	}

	if (!/^[\w.-]+\/[\w.-]+$/u.test(cms.repository)) {
		throw new Error('cms.config.mjs 的 repository 必須使用 owner/repository 格式。');
	}

	if (!cms.branch.trim()) {
		throw new Error('cms.config.mjs 的 branch 不可為空白。');
	}

	if (!/^[\w/-]+$/u.test(cms.collectionRoute)) {
		throw new Error('cms.config.mjs 的 collectionRoute 只能包含英數字、斜線、連字號與底線。');
	}
}

function createCmsYaml() {
	const siteUrl = cms.siteUrl.replace(/\/+$/u, '');
	const siteDomain = new URL(siteUrl).hostname;

	return `# 此檔案由 scripts/generate-cms-config.mjs 自動產生，請修改根目錄的 cms.config.mjs。
backend:
  name: github
  repo: ${yamlString(cms.repository)}
  branch: ${yamlString(cms.branch)}
  site_domain: ${yamlString(siteDomain)}
  base_url: ${yamlString(siteUrl)}
  auth_endpoint: /auth

site_url: ${yamlString(siteUrl)}
display_url: ${yamlString(siteUrl)}
logo_url: ${yamlString(`${siteUrl}/favicon.svg`)}

# 本機搭配 npx decap-server 時，直接讀寫目前的 Git Repository。
local_backend: true

media_folder: ${yamlString(cms.mediaFolder)}
public_folder: ${yamlString(cms.publicMediaFolder)}

collections:
  - name: ${yamlString(cms.collectionName)}
    label: ${yamlString(cms.collectionLabel)}
    label_singular: ${yamlString(cms.collectionLabelSingular)}
    description: ${yamlString(cms.collectionDescription)}
    folder: ${yamlString(cms.contentFolder)}
    create: true
    extension: md
    format: frontmatter
    slug: "{{slug}}"
    preview_path: ${yamlString(`${cms.collectionRoute}/{{slug}}/`)}
    summary: "{{pubDate}}｜{{title}}"
    sortable_fields:
      - pubDate
      - title
    editor:
      preview: false
    fields:
      - label: 標題
        name: title
        widget: string
      - label: 簡短說明
        name: description
        widget: text
        hint: 顯示在首頁及 NEWS 列表，建議使用一至兩句話。
      - label: 發布日期
        name: pubDate
        widget: datetime
        format: YYYY-MM-DD
        date_format: YYYY-MM-DD
        time_format: false
      - label: 文章內容
        name: body
        widget: markdown
`;
}

function createAdminHtml() {
	const cmsScriptUrl = `https://unpkg.com/decap-cms@${cms.decapVersion}/dist/decap-cms.js`;

	return `<!doctype html>
<html lang="zh-Hant">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="robots" content="noindex, nofollow, noarchive" />
		<title>內容管理｜${cms.siteName}</title>
	</head>
	<body>
		<!-- 此檔案由 scripts/generate-cms-config.mjs 自動產生。 -->
		<script src="${cmsScriptUrl}"></script>
	</body>
</html>
`;
}

validateConfig();
await mkdir(adminDirectory, { recursive: true });
await Promise.all([
	writeFile(`${adminDirectory}/config.yml`, createCmsYaml(), 'utf8'),
	writeFile(`${adminDirectory}/index.html`, createAdminHtml(), 'utf8'),
]);

console.log(`Generated Decap CMS files from ${projectRoot}cms.config.mjs`);
