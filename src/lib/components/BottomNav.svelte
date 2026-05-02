<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { navLinks } from '$lib/nav';
</script>

<nav class="fixed right-0 bottom-0 left-0 z-50 flex border-t border-border bg-card md:hidden">
	{#each navLinks as link (link.href)}
		<a
			href={link.href}
			class={cn(
				'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
				page.url.pathname === link.href
					? 'text-primary'
					: 'text-muted-foreground hover:text-foreground'
			)}
		>
			<link.icon class="size-5" />
			{link.shortLabel}
		</a>
	{/each}
</nav>
