import { getUserInfo } from '$lib/api/auth';
import type { DiscordUser } from '$lib/types';

interface AuthState {
	token: string | null;
	user: DiscordUser | null;
}

function createAuthStore() {
	let state = $state<AuthState>({ token: null, user: null });

	return {
		get token() {
			return state.token;
		},
		get user() {
			return state.user;
		},
		get isAuthenticated() {
			return state.token !== null && state.user !== null;
		},
		async init() {
			if (typeof localStorage === 'undefined') return;
			const token = localStorage.getItem('tbz_token');
			if (!token) return;
			state.token = token;
			try {
				state.user = await getUserInfo();
			} catch {
				state.token = null;
				localStorage.removeItem('tbz_token');
			}
		},
		setToken(token: string) {
			state.token = token;
			localStorage.setItem('tbz_token', token);
		},
		setUser(user: DiscordUser) {
			state.user = user;
		},
		logout() {
			state.token = null;
			state.user = null;
			localStorage.removeItem('tbz_token');
		}
	};
}

export const auth = createAuthStore();
