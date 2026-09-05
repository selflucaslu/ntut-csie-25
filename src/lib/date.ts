export function formatDate(date: Date) {
	// 固定使用台北時區，避免部署環境不同而造成日期偏移。
	return date.toLocaleDateString('zh-TW', {
		timeZone: 'Asia/Taipei',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).replaceAll('/', '.');
}
