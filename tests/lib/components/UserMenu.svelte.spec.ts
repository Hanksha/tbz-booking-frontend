import { goto } from '$app/navigation';
import UserMenu from '$lib/components/UserMenu.svelte';
import { auth } from '$lib/stores/auth.svelte';
import { themeStore } from '$lib/stores/theme.svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

describe('UserMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(auth, 'user', 'get').mockReturnValue({
			admin: true,
			userId: '1',
			username: 'user1'
		});
		vi.spyOn(auth, 'logout');
		vi.spyOn(themeStore, 'toggle');
	});

	test('renders the user menu for the current user', async () => {
		vi.spyOn(themeStore, 'isDark', 'get').mockReturnValue(false);

		render(UserMenu);

		await page.getByRole('button', { name: 'Menu utilisateur' }).click();
		await expect.element(page.getByText('user1')).toBeInTheDocument();
		await expect.element(page.getByText('Thème sombre')).toBeInTheDocument();
		await expect.element(page.getByText('Déconnexion')).toBeInTheDocument();
	});
	
	test('renders the user menu for the current user with dark theme', async () => {
		vi.spyOn(themeStore, 'isDark', 'get').mockReturnValue(true);

		render(UserMenu);

		await page.getByRole('button', { name: 'Menu utilisateur' }).click();
		await expect.element(page.getByText('user1')).toBeInTheDocument();
		await expect.element(page.getByText('Thème clair')).toBeInTheDocument();
		await expect.element(page.getByText('Déconnexion')).toBeInTheDocument();
	});

	test('should logout when logout button is clicked', async () => {
		render(UserMenu);

		await page.getByRole('button', { name: 'Menu utilisateur' }).click();
		await page.getByText('Déconnexion').click();

		expect(goto).toHaveBeenCalledWith('/');
		expect(auth.logout).toHaveBeenCalledTimes(1);
	});

	test('should toggle theme when dark theme button is clicked', async () => {
		vi.spyOn(themeStore, 'isDark', 'get').mockReturnValue(false);

		render(UserMenu);

		await page.getByRole('button', { name: 'Menu utilisateur' }).click();
		await page.getByText('Thème sombre').click();

		expect(themeStore.toggle).toHaveBeenCalledTimes(1);
	});

	test('should toggle theme when light theme button is clicked', async () => {
		vi.spyOn(themeStore, 'isDark', 'get').mockReturnValue(true);

		render(UserMenu);

		await page.getByRole('button', { name: 'Menu utilisateur' }).click();
		await page.getByText('Thème clair').click();

		expect(themeStore.toggle).toHaveBeenCalledTimes(1);
	});
});
