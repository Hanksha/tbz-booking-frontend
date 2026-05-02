import BottomNav from '$lib/components/BottomNav.svelte';
import { navLinks } from '$lib/nav';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

describe('BottomNav', () => {
	test('renders the bottom navigation with links', async () => {
		render(BottomNav);
		await expect.element(page.getByRole('navigation')).toBeInTheDocument();
		for (const link of navLinks) {
			await expect
				.element(page.getByRole('link', { name: link.shortLabel, exact: true }))
				.toBeInTheDocument();
		}
	});
});
