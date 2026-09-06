/**
 * Decap CMS 共用設定。
 *
 * 網站網址、Repository 或文章集合有變動時，主要修改這個檔案即可。
 * OAuth Client ID 與 Client Secret 屬於部署環境資料，仍須保存在
 * Cloudflare Variables and Secrets。
 */
export default {
	// 網站與後台顯示資訊
	siteName: '北科資工系學會',
	siteUrl: 'https://ntutcsie.pages.dev',

	// Decap CMS 寫入內容的 GitHub Repository
	repository: 'ntutcsiesa/ntut-csie-25',
	branch: 'main',
	repositoryPrivate: true,

	// 最新消息集合
	collectionName: 'news',
	collectionLabel: '最新消息',
	collectionLabelSingular: '文章',
	collectionDescription: '管理首頁與 NEWS 頁面顯示的文章。',
	contentFolder: 'src/content/news',
	collectionRoute: 'news',

	// 從 CMS 上傳圖片時的保存位置與公開網址
	mediaFolder: 'public/uploads',
	publicMediaFolder: '/uploads',

	// 固定版本可避免 CDN 在未測試的情況下自動升級
	decapVersion: '3.16.0',
};
