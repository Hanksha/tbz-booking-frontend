<script lang="ts">
	import { getEvents } from '$lib/api/discord';
	import { AVG_GAME_HOURS, BOOKING_CALENDAR_COLORS, EVENT_CALENDAR_COLORS } from '$lib/config';
	import { themeStore } from '$lib/stores/theme.svelte';
	import type { Booking } from '$lib/types';
	import {
		createCalendar,
		createViewMonthGrid,
		type CalendarEventExternal
	} from '@schedule-x/calendar';
	import { createEventModalPlugin } from '@schedule-x/event-modal';
	import { createEventsServicePlugin } from '@schedule-x/events-service';
	import { ScheduleXCalendar } from '@schedule-x/svelte';
	import '@schedule-x/theme-shadcn/dist/index.css';
	import { onMount } from 'svelte';
	import 'temporal-polyfill/global';

	const {
		bookings
	}: {
		bookings: Booking[];
	} = $props();

	const eventsService = createEventsServicePlugin();
	const eventModal = createEventModalPlugin();

	let bookingEvents: CalendarEventExternal[] = $derived(
		bookings.map((b) => {
			const date = Temporal.Instant.from(b.dateTime).toZonedDateTimeISO('UTC');
			return {
				id: b.id,
				title: b.game,
				start: date,
				end: date.add(Temporal.Duration.from({ hours: AVG_GAME_HOURS })),
				people: Array.from(new Set([b.username, ...b.players])),
				description: b.description,
				calendarId: 'booking'
			};
		})
	);
	let discordEvents: CalendarEventExternal[] = $state([]);
	async function loadDiscordEvents() {
		discordEvents = (await getEvents()).map((event) => ({
			id: event.id,
			title: event.name,
			start: event.startTime.toZonedDateTimeISO('Europe/Paris'),
			end: (event.endTime || event.startTime)?.toZonedDateTimeISO('Europe/Paris'),
			description: event.description,
			calendarId: 'event'
		}));
	}

	const calendarApp = createCalendar(
		{
			views: [createViewMonthGrid()],
			locale: 'fr-FR',
			theme: 'shadcn',
			events: [],
			calendars: {
				booking: { colorName: 'booking', ...BOOKING_CALENDAR_COLORS },
				event: { colorName: 'event', ...EVENT_CALENDAR_COLORS }
			}
		},
		[eventsService, eventModal]
	);

	$effect(() => {
		eventsService.set([...bookingEvents, ...discordEvents]);
	});

	$effect(() => {
		calendarApp.setTheme(themeStore.isDark ? 'dark' : 'light');
	});

	onMount(loadDiscordEvents);
</script>

<ScheduleXCalendar {calendarApp} />

<style>
	:global(.sx__calendar) {
		overflow: visible !important;
	}
	:global(.sx__date-picker-popup) {
		overflow: hidden !important;
		scrollbar-width: none;
	}
	:global(.sx__date-picker-popup::-webkit-scrollbar) {
		display: none;
	}
	:global(.sx__month-grid-day__header-date.sx__is-today) {
		background-color: var(--primary) !important;
		color: var(--primary-foreground) !important;
	}
	:global(.sx__event-modal) {
		background-color: var(--card) !important;
		border-color: var(--border) !important;
		border-style: var(--tw-border-style);
		border-width: 1px;
		overflow: hidden;
	}
</style>
