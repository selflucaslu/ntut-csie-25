import cms from '../cms.config.mjs';

interface Env {
	GITHUB_OAUTH_ID: string;
}

interface FunctionContext {
	request: Request;
	env: Env;
}

const SITE_ORIGIN = cms.siteUrl.replace(/\/+$/u, '');
const CALLBACK_URL = `${SITE_ORIGIN}/callback`;
const COOKIE_MAX_AGE = 10 * 60;

function randomBase64Url(byteLength: number) {
	const bytes = new Uint8Array(byteLength);
	crypto.getRandomValues(bytes);
	return btoa(String.fromCharCode(...bytes))
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replace(/=+$/u, '');
}

async function createCodeChallenge(verifier: string) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
	return btoa(String.fromCharCode(...new Uint8Array(digest)))
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replace(/=+$/u, '');
}

function secureCookie(name: string, value: string) {
	return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

// 將 Decap CMS 的登入請求導向 GitHub，並以 state 與 PKCE 保護 OAuth 流程。
export const onRequestGet = async ({ request, env }: FunctionContext) => {
	const requestUrl = new URL(request.url);

	if (requestUrl.origin !== SITE_ORIGIN) {
		return new Response('Not found.', { status: 404 });
	}

	if (requestUrl.searchParams.get('provider') !== 'github') {
		return new Response('Invalid OAuth provider.', { status: 400 });
	}

	if (!env.GITHUB_OAUTH_ID) {
		return new Response('OAuth is not configured.', { status: 500 });
	}

	const state = randomBase64Url(32);
	const codeVerifier = randomBase64Url(48);
	const codeChallenge = await createCodeChallenge(codeVerifier);
	const authorizationUrl = new URL('https://github.com/login/oauth/authorize');

	authorizationUrl.searchParams.set('client_id', env.GITHUB_OAUTH_ID);
	authorizationUrl.searchParams.set('redirect_uri', CALLBACK_URL);
	// 私人 Repository 需要 repo scope；公開範本可改用權限較小的 public_repo。
	authorizationUrl.searchParams.set('scope', cms.repositoryPrivate ? 'repo,user' : 'public_repo,user');
	authorizationUrl.searchParams.set('state', state);
	authorizationUrl.searchParams.set('code_challenge', codeChallenge);
	authorizationUrl.searchParams.set('code_challenge_method', 'S256');

	const headers = new Headers({
		'Cache-Control': 'no-store',
		Location: authorizationUrl.toString(),
	});
	headers.append('Set-Cookie', secureCookie('__Host-decap_oauth_state', state));
	headers.append('Set-Cookie', secureCookie('__Host-decap_oauth_verifier', codeVerifier));

	return new Response(null, { status: 302, headers });
};
