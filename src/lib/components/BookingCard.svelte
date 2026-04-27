<script lang="ts">
	import RefuseBookingDialog from '$lib/components/RefuseBookingDialog.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { GAME_LOGO_MAP } from '$lib/config';
	import { auth } from '$lib/stores/auth.svelte';
	import type { Booking } from '$lib/types';
	import { getISOTime } from '$lib/utils';
	import { Check, X } from '@lucide/svelte';
	import { parseISO } from 'date-fns';

	let {
		booking,
		onAccept,
		onRefuse,
		onCancel,
		onModify
	}: {
		booking: Booking;
		onAccept?: (id: string) => void;
		onRefuse?: (id: string) => void;
		onCancel?: (id: string) => void;
		onModify?: (id: string) => void;
	} = $props();

	const statusLabel: Record<Booking['status'], string> = {
		pending: 'En attente',
		accepted: 'Acceptée',
		refused: 'Refusée',
		canceled: 'Annulée'
	};

	const statusClass: Record<Booking['status'], string> = {
		pending: 'status-pending',
		accepted: 'status-accepted',
		refused: 'status-refused',
		canceled: 'status-canceled'
	};

	let refuseDialogOpen = $state(false);

	const time = $derived(getISOTime(booking.dateTime));

	const isOwner = $derived(auth.user?.username === booking.username);
	const isAdmin = $derived(auth.user?.admin ?? false);
	const gameLogo = $derived(GAME_LOGO_MAP[booking.game]);
</script>

<div class="flex gap-3 rounded-lg border border-border bg-card p-4">
	{#if gameLogo}
		<img
			src={gameLogo}
			alt={booking.game}
			class="size-12 shrink-0 rounded bg-muted object-contain p-1"
		/>
	{/if}

	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<span class="truncate font-semibold text-foreground">{booking.game}</span>
			<Badge class={statusClass[booking.status]}>{statusLabel[booking.status]}</Badge>
		</div>

		<p class="text-sm text-muted-foreground">
			{booking.points} pts · {time} · {booking.players.length + 1} joueur{booking.players.length > 0
				? 's'
				: ''}
		</p>

		<p class="text-sm text-foreground">
			<span class="text-muted-foreground">Organisé par</span>
			{booking.username}
		</p>

		{#if booking.players.length > 0}
			<p class="truncate text-xs text-muted-foreground">
				Avec : {booking.players.join(', ')}
			</p>
		{/if}

		{#if booking.description}
			<p class="truncate text-xs text-muted-foreground italic">{booking.description}</p>
		{/if}

		{#if booking.status === 'pending'}
			<div class="mt-2 flex flex-wrap gap-2">
				{#if isAdmin}
					{#if onAccept !== undefined}
						<Button size="sm" onclick={() => onAccept?.(booking.id)} class="gap-1.5">
							<Check class="size-3.5" /> Accepter
						</Button>
					{/if}
					{#if onRefuse !== undefined}
						<Button
							size="sm"
							variant="destructive"
							onclick={() => (refuseDialogOpen = true)}
							class="gap-1.5"
						>
							<X class="size-3.5" /> Refuser
						</Button>
					{/if}
				{/if}
				{#if isOwner}
					<Button size="sm" variant="secondary" onclick={() => onModify?.(booking.id)}>
						Modifier
					</Button>
					<Button size="sm" variant="outline" onclick={() => onCancel?.(booking.id)}>
						Annuler
					</Button>
				{/if}
			</div>
		{/if}
	</div>

	<RefuseBookingDialog
		bookingId={booking.id}
		bind:open={refuseDialogOpen}
		onRefused={() => onRefuse?.(booking.id)}
	/>
</div>

<style>
	:global(.status-pending) {
		background-color: var(--color-status-pending);
		color: #fff;
	}
	:global(.status-accepted) {
		background-color: var(--color-status-accepted);
		color: #fff;
	}
	:global(.status-refused) {
		background-color: var(--color-status-refused);
		color: #fff;
	}
	:global(.status-canceled) {
		background-color: var(--color-status-canceled);
		color: #fff;
	}
</style>
