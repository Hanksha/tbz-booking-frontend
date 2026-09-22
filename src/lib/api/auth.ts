import { API_BASE_URL } from '$lib/config';
import type { DiscordUser, OAuthToken } from '$lib/types';
import { apiFetch, ApiError, translateApiError } from './client';

export async function exchangeCode(code: string): Promise<OAuthToken> {
	const response = await fetch(`${API_BASE_URL}/api/discord/oauth/callback?code=${encodeURIComponent(code)}`);
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new ApiError(
			response.status,
			translateApiError(body.error ?? "Échec de l'authentification Discord")
		);
	}
	return response.json();
}

export async function getUserInfo(): Promise<DiscordUser> {
	return apiFetch<DiscordUser>('/api/discord/user/info');
}
