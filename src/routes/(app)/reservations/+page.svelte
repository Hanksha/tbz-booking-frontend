<script lang="ts">
	import { acceptBooking, cancelBooking, getActiveBookings } from '$lib/api/bookings';
	import BookingCard from '$lib/components/BookingCard.svelte';
	import NewBookingDialog from '$lib/components/NewBookingDialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Spinner } from '$lib/components/ui/spinner';
	import { SHOP_NAME } from '$lib/config';
	import { auth } from '$lib/stores/auth.svelte';
	import type { Booking } from '$lib/types';
	import { ListFilter, Plus } from '@lucide/svelte';
	import { parseISO } from 'date-fns';
	import { onMount } from 'svelte';

	let dialogOpen = $state(false);
	let hideCancelled = $state(true);
	let showOnlyOwned = $state(false);

	let allBookings = $state<Booking[]>([]);
	let bookings = $derived(
		allBookings
			.filter((b) => !hideCancelled || b.status !== 'canceled')
			.filter((b) => !showOnlyOwned || b.userId === auth.user?.userId)
	);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let bookingToModify = $state<Booking | undefined>(undefined);

	async function load() {
		loading = true;
		error = null;
		try {
			allBookings = await getActiveBookings();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erreur lors du chargement.';
		} finally {
			loading = false;
		}
	}

	async function handleAccept(id: string) {
		await acceptBooking(id);
		await load();
	}

	async function handleCancel(id: string) {
		await cancelBooking(id);
		await load();
	}

	function handleModify(booking: Booking) {
		bookingToModify = booking;
		dialogOpen = true;
	}

	function handleCreatedOrModified() {
		bookingToModify = undefined;
		load();
	}

	const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});

	const grouped = $derived.by(() => {
		const sorted = [...bookings].sort(
			(a, b) => parseISO(b.dateTime).getTime() - parseISO(a.dateTime).getTime()
		);
		const groups: { label: string; date: Date; bookings: Booking[] }[] = [];
		for (const b of sorted) {
			const parsed = parseISO(b.dateTime);
			const label = dayFormatter.format(parsed);
			const existing = groups.find((g) => g.label === label);
			if (existing) existing.bookings.push(b);
			else groups.push({ label, date: parsed, bookings: [b] });
		}
		return groups.sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	onMount(load);
</script>

<svelte:head>
	<title>{SHOP_NAME} – Réservations</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-2xl font-bold">Réservations</h1>
	<div class="flex items-center gap-5">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="ghost" size="icon" {...props} aria-label="Menu utilisateur">
						<ListFilter class="size-5" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>

			<DropdownMenu.Content align="end" class="w-60">
				<DropdownMenu.DropdownMenuCheckboxItem bind:checked={hideCancelled}>
					Filtrer les annulations
				</DropdownMenu.DropdownMenuCheckboxItem>
				<DropdownMenu.DropdownMenuCheckboxItem bind:checked={showOnlyOwned}>
					Afficher mes réservations
				</DropdownMenu.DropdownMenuCheckboxItem>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<Button class="gap-2" onclick={() => (dialogOpen = true)}>
			<Plus class="size-4" />
			<span class="hidden sm:inline">Nouvelle réservation</span>
		</Button>
	</div>
</div>

<NewBookingDialog
	bind:open={dialogOpen}
	onCreated={handleCreatedOrModified}
	{bookings}
	existingBooking={bookingToModify}
/>

{#if loading}
	<div class="flex justify-center py-16">
		<Spinner />
	</div>
{:else if error}
	<div
		class="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
	>
		{error}
		<Button variant="link" class="ml-2 h-auto p-0" onclick={load}>Réessayer</Button>
	</div>
{:else if grouped.length === 0}
	<div class="flex flex-col items-center gap-2 py-16 text-muted-foreground">
		<p>Aucune réservation active.</p>
		<p class="text-sm">Soyez le premier à réserver une table !</p>
	</div>
{:else}
	<div class="flex flex-col gap-8">
		{#each grouped as { label, bookings: dayBookings } (label)}
			<section>
				<h2 class="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
					{label}
				</h2>
				<div class="flex flex-col gap-3">
					{#each dayBookings as booking (booking.id)}
						<BookingCard
							{booking}
							onAccept={handleAccept}
							onRefuse={load}
							onCancel={handleCancel}
							onModify={() => handleModify(booking)}
						/>
					{/each}
				</div>
			</section>
		{/each}
	</div>
{/if}
