import { apiFetch } from './client';

export function searchUsers(query: string): Promise<string[]> {
	return apiFetch<string[]>(`/api/discord/user/search?query=${encodeURIComponent(query)}`);
}
