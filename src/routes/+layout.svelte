<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { auth } from '$lib/stores/auth.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import './layout.css';
	import { Spinner } from '$lib/components/ui/spinner';

	let { children } = $props();
	let ready = $state(false);

	const PUBLIC_ROUTES = ['/', '/auth/callback'];

	onMount(async () => {
		themeStore.init();
		await auth.init();

		const isPublic = PUBLIC_ROUTES.includes(page.url.pathname);

		if (!auth.isAuthenticated && !isPublic) {
			goto('/');
		} else if (auth.isAuthenticated && page.url.pathname === '/') {
			goto('/reservations');
		}

		ready = true;
	});
</script>

{#if ready}
	{@render children()}
{:else}
	<div class="flex min-h-dvh items-center justify-center">
		<Spinner />
	</div>
{/if}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
