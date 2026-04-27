<script lang="ts">
	import { createBooking, modifyBooking } from '$lib/api/bookings';
	import { searchUsers } from '$lib/api/discord';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { AVG_GAME_HOURS, GAMES, MAX_TABLES, OPENING_HOURS, SHOP_HOURS } from '$lib/config';
	import { auth } from '$lib/stores/auth.svelte';
	import type { Booking } from '$lib/types';
	import {
		CalendarDate,
		fromDate,
		getLocalTimeZone,
		toCalendarDate,
		today
	} from '@internationalized/date';
	import { addHours, format, formatISO, getDay, isAfter, parseISO, set } from 'date-fns';
	import { fr as frLocale } from 'date-fns/locale';
	import { AlertTriangle, CalendarIcon, X } from '@lucide/svelte';

	let {
		open = $bindable(false),
		onCreated,
		bookings = [],
		existingBooking
	}: {
		open?: boolean;
		onCreated?: () => void;
		bookings?: Booking[];
		existingBooking?: Booking;
	} = $props();

	let game = $derived(existingBooking?.game || '');
	let date = $derived<CalendarDate | undefined>(
		existingBooking?.dateTime
			? toCalendarDate(fromDate(parseISO(existingBooking.dateTime), getLocalTimeZone()))
			: undefined
	);
	let time = $derived.by(() => {
		if(!existingBooking?.dateTime) return '10:00';
		const d = parseISO(existingBooking.dateTime);
		return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
	});
	let points = $derived(existingBooking?.points || 2000);
	let description = $derived(existingBooking?.description || '');
	let reminderEnabled = $derived(existingBooking?.reminderEnabled || true);
	let players = $derived<string[]>(existingBooking?.players || []);
	let playerQuery = $state('');
	let playerSuggestions = $state<string[]>([]);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const dateLabel = $derived(
		date
			? format(date.toDate(getLocalTimeZone()), 'EEEE d MMMM yyyy', { locale: frLocale })
			: 'Choisir une date'
	);

	/** 0 = Monday … 6 = Sunday (matching SHOP_HOURS index) */
	function isoWeekdayIndex(d: Date): number {
		return (getDay(d) + 6) % 7;
	}

	function toMinutes(hhmm: string): number {
		const [h, m] = hhmm.split(':').map(Number);
		return h * 60 + m;
	}

	const validation = $derived.by(() => {
		if (!date || !time) return { dateError: null, timeError: null };

		const [h, m] = time.split(':').map(Number);
		const bookingDate = set(date.toDate(getLocalTimeZone()), {
			hours: h,
			minutes: m,
			seconds: 0,
			milliseconds: 0
		});

		let dateError: string | null = null;
		let timeError: string | null = null;

		if (!isAfter(bookingDate, addHours(new Date(), 12))) {
			dateError = "La réservation doit être au moins 12h à l'avance.";
		}

		const dayIdx = isoWeekdayIndex(bookingDate);
		const shopDay = SHOP_HOURS[dayIdx];
		if (!shopDay) {
			timeError = 'La boutique est fermée ce jour.';
		} else if (
			toMinutes(time) < toMinutes(shopDay.open) ||
			toMinutes(time) >= toMinutes(shopDay.close)
		) {
			timeError = `Heure hors des horaires d'ouverture (${shopDay.open.replace(':', 'h')} – ${shopDay.close.replace(':', 'h')}).`;
		}

		return { dateError, timeError };
	});

	const busyDayWarning = $derived.by(() => {
		if (!date || !time) return false;
		const [h, m] = time.split(':').map(Number);
		const slotStart = set(date.toDate(getLocalTimeZone()), {
			hours: h,
			minutes: m,
			seconds: 0,
			milliseconds: 0
		});
		const slotEnd = addHours(slotStart, AVG_GAME_HOURS);

		const overlapping = bookings.filter((b) => {
			if (b.status !== 'accepted' && b.status !== 'pending') return false;
			const bStart = parseISO(b.dateTime);
			const bEnd = addHours(bStart, AVG_GAME_HOURS);
			return bStart < slotEnd && bEnd > slotStart;
		});

		return overlapping.length >= MAX_TABLES * 0.75;
	});

	const isValid = $derived(
		!!game && !!date && !!time && !!points && !validation.dateError && !validation.timeError
	);

	const isEditMode = $derived(!!existingBooking);

	let searchTimeout: ReturnType<typeof setTimeout>;
	function onPlayerInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		playerQuery = val;
		clearTimeout(searchTimeout);
		if (val.length < 2) {
			playerSuggestions = [];
			return;
		}
		searchTimeout = setTimeout(async () => {
			try {
				const results = await searchUsers(val);
				playerSuggestions = results.filter(
					(u) => u !== auth.user?.username && !players.includes(u)
				);
			} catch {
				playerSuggestions = [];
			}
		}, 300);
	}

	function addPlayer(username: string) {
		if (!players.includes(username)) players = [...players, username];
		playerQuery = '';
		playerSuggestions = [];
	}

	function removePlayer(username: string) {
		players = players.filter((p) => p !== username);
	}

	async function submit() {
		if (!isValid || !game || !date || !time || !points) return;
		error = null;
		submitting = true;

		const [hours, minutes] = time.split(':').map(Number);
		const bookingDate = set(date.toDate(getLocalTimeZone()), {
			hours,
			minutes,
			seconds: 0,
			milliseconds: 0
		});
		const dateTime = formatISO(bookingDate);

		try {
			if (isEditMode && existingBooking) {
				await modifyBooking(existingBooking.id, {
					game,
					dateTime,
					players,
					description,
					reminderEnabled,
					points
				});
			} else {
				await createBooking({
					game,
					dateTime,
					players,
					description,
					reminderEnabled,
					points,
					userId: auth.user!.userId,
					username: auth.user!.username
				});
			}
			open = false;
			onCreated?.();
			resetForm();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erreur lors de la création.';
		} finally {
			submitting = false;
		}
	}

	function resetForm() {
		game = '';
		date = undefined;
		time = '10:00';
		description = '';
		reminderEnabled = true;
		players = [];
		playerQuery = '';
		playerSuggestions = [];
		error = null;
	}

	const minDate = today(getLocalTimeZone());
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>{isEditMode ? 'Modifier la réservation' : 'Nouvelle réservation'}</Dialog.Title>
			<Dialog.Description
				>{isEditMode
					? 'Modifiez votre réservation.'
					: 'Réservez une table pour votre partie.'}</Dialog.Description
			>
		</Dialog.Header>

		<!-- Busy day warning -->
		{#if busyDayWarning}
			<div
				class="flex items-start gap-2 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-400"
			>
				<AlertTriangle class="mt-0.5 size-4 shrink-0" />
				<span>Ce jour est très chargé. Des créneaux peuvent être indisponibles.</span>
			</div>
		{/if}

		<FieldSet>
			<!-- Game -->
			<Field>
				<FieldLabel for="game">Jeu *</FieldLabel>
				<Select.Root type="single" bind:value={game}>
					<Select.Trigger class="w-full">
						{game || 'Sélectionner un jeu'}
					</Select.Trigger>
					<Select.Content>
						{#each GAMES as g (g.name)}
							<Select.Item value={g.name}>{g.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</Field>

			<!-- Date -->
			<Field>
				<FieldLabel>Date *</FieldLabel>
				<Popover.Root>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button variant="outline" class="w-full justify-start gap-2 font-normal" {...props}>
								<CalendarIcon class="size-4 text-muted-foreground" />
								{dateLabel}
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" align="start">
						<Calendar type="single" bind:value={date} minValue={minDate} locale="fr-FR" />
					</Popover.Content>
				</Popover.Root>
				{#if validation.dateError}
					<FieldError>{validation.dateError}</FieldError>
				{/if}
			</Field>

			<!-- Time -->
			<Field>
				<FieldLabel for="time">Heure *</FieldLabel>
				<Input id="time" type="time" bind:value={time} />
				{#if validation.timeError}
					<FieldError>{validation.timeError}</FieldError>
				{/if}
				<details class="text-xs text-muted-foreground">
					<summary class="cursor-pointer select-none">Horaires d'ouverture</summary>
					<ul class="mt-1.5 space-y-0.5 pl-1">
						{#each OPENING_HOURS as { day, hours } (day)}
							<li class="flex gap-2">
								<span class="w-20 shrink-0 font-medium">{day}</span>
								<span>{hours}</span>
							</li>
						{/each}
					</ul>
				</details>
			</Field>

			<!-- Points -->
			<Field>
				<FieldLabel for="points">Points</FieldLabel>
				<Input
					type="number"
					id="points"
					bind:value={points}
					placeholder="Nombre de points…"
					min="1"
				/>
			</Field>

			<!-- Players -->
			<Field>
				<FieldLabel>Joueurs supplémentaires</FieldLabel>
				{#if players.length > 0}
					<div class="mb-1 flex flex-wrap gap-1">
						{#each players as player (player)}
							<span
								class="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
							>
								{player}
								<Button
									variant="ghost"
									size="icon"
									class="size-4"
									onclick={() => removePlayer(player)}
								>
									<X class="size-3" />
								</Button>
							</span>
						{/each}
					</div>
				{/if}
				<div class="relative">
					<Input
						type="text"
						placeholder="Rechercher un joueur…"
						value={playerQuery}
						oninput={onPlayerInput}
					/>
					{#if playerSuggestions.length > 0}
						<ul
							class="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md"
						>
							{#each playerSuggestions as suggestion (suggestion)}
								<li>
									<Button
										variant="ghost"
										class="w-full justify-start rounded-none px-3 py-2 text-sm"
										onclick={() => addPlayer(suggestion)}
									>
										{suggestion}
									</Button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</Field>

			<!-- Description -->
			<Field>
				<FieldLabel for="description">Description (optionnel)</FieldLabel>
				<Textarea
					id="description"
					bind:value={description}
					placeholder="Informations supplémentaires…"
					rows={2}
				/>
			</Field>

			<!-- Reminder -->
			<Field orientation="horizontal">
				<Checkbox id="reminderEnabled" bind:checked={reminderEnabled} />
				<FieldContent>
					<FieldLabel for="reminderEnabled">Recevoir un rappel Discord</FieldLabel>
				</FieldContent>
			</Field>

			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}
		</FieldSet>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
			<Button onclick={submit} disabled={!isValid || submitting}>
				{submitting ? (isEditMode ? 'Modification…' : 'Création…') : isEditMode ? 'Modifier' : 'Réserver'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(input[type='time']::-webkit-calendar-picker-indicator) {
		filter: invert(1);
	}

	:global(.light input[type='time']::-webkit-calendar-picker-indicator) {
		filter: invert(0);
	}
</style>
