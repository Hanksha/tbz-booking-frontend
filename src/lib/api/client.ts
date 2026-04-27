import { API_BASE_URL } from '$lib/config';
import { auth } from '$lib/stores/auth.svelte';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};

	if (auth.token) {
		headers['accesstoken'] = auth.token;
	}

	const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

	if (response.status === 401) {
		auth.logout();
		throw new ApiError(401, 'Session expirée, veuillez vous reconnecter.');
	}

	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new ApiError(response.status, body.error ?? `Erreur ${response.status}`);
	}

	if (response.status === 204) return undefined as T;

	return response.json() as Promise<T>;
}
