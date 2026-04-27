<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-dvh flex-col">
	<Navbar />
	<main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 md:pb-6">
		{@render children()}
	</main>
	<BottomNav />
</div>
