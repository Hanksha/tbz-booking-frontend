import Navbar from '$lib/components/Navbar.svelte';
import { navLinks } from '$lib/nav';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

describe('Navbar', () => {
	test('renders the bottom navigation with links', async () => {
		render(Navbar);

		await expect.element(page.getByRole('navigation')).toBeInTheDocument();

		for (const link of navLinks) {
			await expect
				.element(page.getByRole('link', { name: link.label, exact: true }))
				.toBeInTheDocument();
		}

		expect(page.getByRole('button', { name: 'Menu utilisateur' })).toBeInTheDocument();
	});
});
