<script lang="ts">
	import { onMount } from 'svelte';
	import { Bar } from 'svelte-chartjs';
	import {
		Chart,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend,
		type ChartData,
		type ChartOptions
	} from 'chart.js';
	import { format, subMonths } from 'date-fns';
	import { Button } from '$lib/components/ui/button';
	import { Field, FieldLabel } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { getStatsByGame, getStatsByGamePeriod, getStatsByDay } from '$lib/api/stats';
	import { SHOP_NAME } from '$lib/config';
	import type { GameBookingCount, WeekDayBookingCount } from '$lib/types';

	Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

	const DAY_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

	let gameStats = $state<GameBookingCount[]>([]);
	let dayStats = $state<WeekDayBookingCount[]>([]);
	let loadingGame = $state(true);
	let loadingDay = $state(true);
	let errorGame = $state<string | null>(null);
	let errorDay = $state<string | null>(null);

	let periodStart = $state(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
	let periodEnd = $state(format(new Date(), 'yyyy-MM-dd'));
	let usePeriod = $state(false);

	async function loadGameStats() {
		loadingGame = true;
		errorGame = null;
		try {
			gameStats = usePeriod
				? await getStatsByGamePeriod(periodStart, periodEnd)
				: await getStatsByGame();
		} catch (e) {
			errorGame = e instanceof Error ? e.message : 'Erreur lors du chargement.';
		} finally {
			loadingGame = false;
		}
	}

	async function loadDayStats() {
		loadingDay = true;
		errorDay = null;
		try {
			dayStats = await getStatsByDay();
		} catch (e) {
			errorDay = e instanceof Error ? e.message : 'Erreur lors du chargement.';
		} finally {
			loadingDay = false;
		}
	}

	const gameChartData = $derived<ChartData<'bar'>>({
		labels: gameStats.map((s) => s.game),
		datasets: [
			{
				label: 'Réservations',
				data: gameStats.map((s) => s.bookingCount),
				backgroundColor: 'oklch(0.6 0.2 290 / 0.7)',
				borderColor: 'oklch(0.6 0.2 290)',
				borderWidth: 1,
				borderRadius: 4
			}
		]
	});

	const sortedDayStats = $derived(
		[...dayStats].sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
	);

	const dayChartData = $derived<ChartData<'bar'>>({
		labels: sortedDayStats.map((s) => s.dayOfWeek),
		datasets: [
			{
				label: 'Réservations',
				data: sortedDayStats.map((s) => s.bookingCount),
				backgroundColor: 'oklch(0.65 0.15 200 / 0.7)',
				borderColor: 'oklch(0.65 0.15 200)',
				borderWidth: 1,
				borderRadius: 4
			}
		]
	});

	const chartOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: { legend: { display: false } },
		scales: {
			y: { beginAtZero: true, ticks: { stepSize: 1 } }
		}
	};

	onMount(() => {
		loadGameStats();
		loadDayStats();
	});
</script>

<svelte:head>
	<title>{SHOP_NAME} – Statistiques</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold">Statistiques</h1>

<div class="flex flex-col gap-8">
	<!-- Bookings by game -->
	<section class="rounded-lg border border-border bg-card p-4">
		<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
			<h2 class="text-base font-semibold">Réservations par jeu</h2>
			<div class="flex flex-wrap items-end gap-3">
				{#if usePeriod}
					<Field orientation="horizontal" class="gap-2">
						<FieldLabel class="shrink-0 text-xs">Du</FieldLabel>
						<Input type="date" bind:value={periodStart} class="h-8 text-xs" />
					</Field>
					<Field orientation="horizontal" class="gap-2">
						<FieldLabel class="shrink-0 text-xs">Au</FieldLabel>
						<Input type="date" bind:value={periodEnd} class="h-8 text-xs" />
					</Field>
					<Button size="sm" onclick={loadGameStats}>Filtrer</Button>
					<Button size="sm" variant="ghost" onclick={() => { usePeriod = false; loadGameStats(); }}>
						Tout afficher
					</Button>
				{:else}
					<Button size="sm" variant="outline" onclick={() => (usePeriod = true)}>
						Filtrer par période
					</Button>
				{/if}
			</div>
		</div>

		{#if loadingGame}
			<div class="flex justify-center py-10"><Spinner /></div>
		{:else if errorGame}
			<p class="text-sm text-destructive">{errorGame}</p>
		{:else if gameStats.length === 0}
			<p class="py-6 text-center text-sm text-muted-foreground">Aucune donnée.</p>
		{:else}
			<Bar data={gameChartData} options={chartOptions} />
		{/if}
	</section>

	<!-- Bookings by weekday -->
	<section class="rounded-lg border border-border bg-card p-4">
		<h2 class="mb-4 text-base font-semibold">Réservations par jour de la semaine</h2>

		{#if loadingDay}
			<div class="flex justify-center py-10"><Spinner /></div>
		{:else if errorDay}
			<p class="text-sm text-destructive">{errorDay}</p>
		{:else if dayStats.length === 0}
			<p class="py-6 text-center text-sm text-muted-foreground">Aucune donnée.</p>
		{:else}
			<Bar data={dayChartData} options={chartOptions} />
		{/if}
	</section>
</div>
