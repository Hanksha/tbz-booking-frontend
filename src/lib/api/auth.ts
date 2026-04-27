import { API_BASE_URL } from '$lib/config';
import type { DiscordUser, OAuthToken } from '$lib/types';
import { apiFetch } from './client';

export async function exchangeCode(code: string): Promise<OAuthToken> {
	const response = await fetch(`${API_BASE_URL}/api/discord/oauth/callback?code=${encodeURIComponent(code)}`);
	if (!response.ok) {
		throw new Error('Échec de l\'authentification Discord');
	}
	return response.json();
}

export async function getUserInfo(): Promise<DiscordUser> {
	return apiFetch<DiscordUser>('/api/discord/user/info');
}
