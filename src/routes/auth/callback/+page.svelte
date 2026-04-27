<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { exchangeCode, getUserInfo } from '$lib/api/auth';
	import { Button } from '$lib/components/ui/button';
	import { SHOP_NAME } from '$lib/config';
	import { auth } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';
	import { Spinner } from '$lib/components/ui/spinner';

	let error = $state<string | null>(null);

	onMount(async () => {
		const code = page.url.searchParams.get('code');

		if (!code) {
			error = "Code d'autorisation manquant.";
			return;
		}

		try {
			const token = await exchangeCode(code);
			auth.setToken(token.access_token);

			const user = await getUserInfo();
			auth.setUser(user);

			goto('/reservations');
		} catch (e) {
			error = e instanceof Error ? e.message : "Erreur d'authentification.";
		}
	});
</script>

<svelte:head>
	<title>{SHOP_NAME} – Connexion en cours…</title>
</svelte:head>

<main class="callback-page">
	{#if error}
		<div class="error-card">
			<p class="error-msg">{error}</p>
			<Button href="/" variant="link" class="h-auto p-0">Retour à la connexion</Button>
		</div>
	{:else}
		<div class="loading">
			<Spinner />
			<p>Connexion en cours…</p>
		</div>
	{/if}
</main>

<style>
	.callback-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--background);
		color: var(--foreground);
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		color: var(--muted-foreground);
	}


	.error-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: 1rem;
		padding: 2rem;
		max-width: 360px;
		text-align: center;
	}

	.error-msg {
		color: var(--destructive);
	}
</style>
