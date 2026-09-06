interface Env {
	GITHUB_OAUTH_ID: string;
	GITHUB_OAUTH_SECRET: string;
}

interface FunctionContext {
	request: Request;
	env: Env;
}

interface GitHubTokenResponse {
	access_token?: string;
	error?: string;
	error_description?: string;
}

const SITE_ORIGIN = 'https://ntutcsie.pages.dev';
const CALLBACK_URL = `${SITE_ORIGIN}/callback`;

function readCookie(request: Request, name: string) {
	const cookieHeader = request.headers.get('Cookie') ?? '';
	for (const cookie of cookieHeader.split(';')) {
		const [cookieName, ...valueParts] = cookie.trim().split('=');
		if (cookieName === name) return valueParts.join('=');
	}
	return undefined;
}

function valuesMatch(left: string | undefined, right: string | null) {
	if (!left || !right || left.length !== right.length) return false;

	let difference = 0;
	for (let index = 0; index < left.length; index += 1) {
		difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
	}
	return difference === 0;
}

function clearOAuthCookies(headers: Headers) {
	const expiredCookie = 'Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
	headers.append('Set-Cookie', `__Host-decap_oauth_state=; ${expiredCookie}`);
	headers.append('Set-Cookie', `__Host-decap_oauth_verifier=; ${expiredCookie}`);
}

function callbackPage(status: 'success' | 'error', content: Record<string, string>) {
	const message = `authorization:github:${status}:${JSON.stringify(content)}`;
	// JSON 字串另外跳脫 <，避免任何錯誤文字被解讀成 HTML 標籤。
	const serializedMessage = JSON.stringify(message).replaceAll('<', '\\u003c');
	const serializedOrigin = JSON.stringify(SITE_ORIGIN);
	const html = `<!doctype html>
<html lang="zh-Hant">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="robots" content="noindex, nofollow, noarchive" />
		<title>正在完成 GitHub 登入</title>
	</head>
	<body>
		<p>正在完成登入，請稍候……</p>
		<script>
			const siteOrigin = ${serializedOrigin};
			const authorizationMessage = ${serializedMessage};
			const receiveMessage = (event) => {
				if (event.origin !== siteOrigin || event.source !== window.opener) return;
				window.opener.postMessage(authorizationMessage, siteOrigin);
				window.removeEventListener('message', receiveMessage);
				window.setTimeout(() => window.close(), 100);
			};

			window.addEventListener('message', receiveMessage);
			if (window.opener) window.opener.postMessage('authorizing:github', siteOrigin);
		</script>
	</body>
</html>`;

	const headers = new Headers({
		'Cache-Control': 'no-store',
		'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'none'; img-src 'none'; base-uri 'none'; frame-ancestors 'none'",
		'Content-Type': 'text/html; charset=UTF-8',
		'Referrer-Policy': 'no-referrer',
		'X-Content-Type-Options': 'nosniff',
	});
	clearOAuthCookies(headers);

	return new Response(html, { status: 200, headers });
}

// 驗證 GitHub 回傳的 state，再以一次性 code 交換 Decap CMS 所需的存取權杖。
export const onRequestGet = async ({ request, env }: FunctionContext) => {
	const requestUrl = new URL(request.url);

	if (requestUrl.origin !== SITE_ORIGIN) {
		return new Response('Not found.', { status: 404 });
	}

	const storedState = readCookie(request, '__Host-decap_oauth_state');
	const returnedState = requestUrl.searchParams.get('state');
	const codeVerifier = readCookie(request, '__Host-decap_oauth_verifier');

	if (!valuesMatch(storedState, returnedState) || !codeVerifier) {
		return callbackPage('error', { error: 'OAuth state validation failed.' });
	}

	if (requestUrl.searchParams.has('error')) {
		return callbackPage('error', { error: 'GitHub authorization was cancelled.' });
	}

	const code = requestUrl.searchParams.get('code');
	if (!code || !env.GITHUB_OAUTH_ID || !env.GITHUB_OAUTH_SECRET) {
		return callbackPage('error', { error: 'OAuth is not configured correctly.' });
	}

	try {
		const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: env.GITHUB_OAUTH_ID,
				client_secret: env.GITHUB_OAUTH_SECRET,
				code,
				code_verifier: codeVerifier,
				redirect_uri: CALLBACK_URL,
			}),
		});
		const token = (await tokenResponse.json()) as GitHubTokenResponse;

		if (!tokenResponse.ok || !token.access_token) {
			return callbackPage('error', { error: token.error_description ?? token.error ?? 'GitHub token exchange failed.' });
		}

		return callbackPage('success', { token: token.access_token, provider: 'github' });
	} catch {
		return callbackPage('error', { error: 'Unable to contact GitHub.' });
	}
};
