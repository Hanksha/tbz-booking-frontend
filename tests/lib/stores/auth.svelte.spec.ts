import { getUserInfo } from '$lib/api/auth';
import { auth } from '$lib/stores/auth.svelte';
import type { DiscordUser } from '$lib/types';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';

let mockGetUserInfo = vi.fn();

vi.mock('$lib/api/auth', () => ({
    getUserInfo: vi.fn()
}));

describe('auth store', () => {
    beforeEach(() => {
        // Reset the store state before each test
        auth.logout();
        mockGetUserInfo = getUserInfo as Mock;
        mockGetUserInfo.mockResolvedValue({ userId: '1', username: 'John Doe', admin: false });
    });

	test('initial state is correct', () => {
		const { user, token } = auth;
		expect(user).toBeNull();
		expect(token).toBeNull();
	});

	test('init reads token from localStorage and fetches user info', async () => {
		const mockToken = 'mock-token';
		const mockUser: DiscordUser = { userId: '1', username: 'John Doe', admin: false };

		localStorage.setItem('tbz_token', mockToken);
		await auth.init();

		expect(auth.token).toEqual(mockToken);
		expect(auth.user).toEqual(mockUser);
	});

	test('init handles failed user info fetch', async () => {
		const mockToken = 'mock-token';
        mockGetUserInfo.mockRejectedValueOnce(new Error('Failed to fetch user info'));
		localStorage.setItem('tbz_token', mockToken);

		await auth.init();

		expect(auth.token).toBeNull();
		expect(auth.user).toBeNull();
	});

	test('init handles missing token', async () => {
		await auth.init();

		expect(auth.token).toBeNull();
		expect(auth.user).toBeNull();
	});

	test('setUser updates the user', () => {
		const mockUser: DiscordUser = { userId: '1', username: 'John Doe', admin: false };

		auth.setUser(mockUser);

		expect(auth.user).toEqual(mockUser);
	});

	test('setToken updates the token', () => {
		const mockToken = 'mock-token';

		auth.setToken(mockToken);

		expect(auth.token).toEqual(mockToken);
		expect(localStorage.getItem('tbz_token')).toBe(mockToken);
	});

	test('logout resets the user and token', () => {
		const mockUser: DiscordUser = { userId: '1', username: 'John Doe', admin: false };
		const mockToken = 'mock-token';

		auth.setUser(mockUser);
		auth.setToken(mockToken);
		auth.logout();

		expect(auth.user).toBeNull();
		expect(auth.token).toBeNull();
        expect(localStorage.getItem('tbz_token')).toBeNull();
	});

	test('isAuthenticated returns true when token and user are set', () => {
		const mockUser: DiscordUser = { userId: '1', username: 'John Doe', admin: false };
		const mockToken = 'mock-token';

		auth.setUser(mockUser);
		auth.setToken(mockToken);

		expect(auth.isAuthenticated).toBe(true);
	});

	test('isAuthenticated returns false when token is missing', () => {
		const mockUser: DiscordUser = { userId: '1', username: 'John Doe', admin: false };

		auth.setUser(mockUser);
		auth.setToken(null as unknown as string);

		expect(auth.isAuthenticated).toBe(false);
	});

	test('isAuthenticated returns false when user is missing', () => {
		const mockToken = 'mock-token';

		auth.setUser(null as unknown as DiscordUser);
		auth.setToken(mockToken);

		expect(auth.isAuthenticated).toBe(false);
	});
});
