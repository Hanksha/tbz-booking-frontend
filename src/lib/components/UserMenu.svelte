<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Separator } from '$lib/components/ui/separator';
	import { Moon, Sun, LogOut, User } from '@lucide/svelte';

	function logout() {
		auth.logout();
		goto('/');
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" size="icon" {...props} aria-label="Menu utilisateur">
				<User class="size-5" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="w-52">
		<div class="px-3 py-2">
			<p class="text-sm font-medium truncate">{auth.user?.username ?? '…'}</p>
		</div>

		<Separator />

		<DropdownMenu.Item onclick={themeStore.toggle}>
			{#if themeStore.isDark}
				<Sun class="mr-2 size-4" />
				Thème clair
			{:else}
				<Moon class="mr-2 size-4" />
				Thème sombre
			{/if}
		</DropdownMenu.Item>

		<Separator />

		<DropdownMenu.Item onclick={logout} class="text-destructive focus:text-destructive">
			<LogOut class="mr-2 size-4" />
			Déconnexion
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
