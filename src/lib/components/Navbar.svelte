<script lang="ts">
	import { page } from '$app/state';
	import { SHOP_NAME } from '$lib/config';
	import UserMenu from './UserMenu.svelte';
	import { cn } from '$lib/utils';
	import { navLinks } from '$lib/nav';
</script>

<header class="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
	<div class="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
		<span class="shrink-0 font-bold text-foreground">{SHOP_NAME}</span>

		<nav class="hidden flex-1 items-center gap-1 md:flex">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class={cn(
						'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
						page.url.pathname === link.href
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'
					)}
				>
					<link.icon class="size-4" />
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="ml-auto">
			<UserMenu />
		</div>
	</div>
</header>
