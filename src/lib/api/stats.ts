import type { GameBookingCount, WeekDayBookingCount } from '$lib/types';
import { apiFetch } from './client';

export function getStatsByGame(): Promise<GameBookingCount[]> {
	return apiFetch<GameBookingCount[]>('/api/v1/bookings/stats/game');
}

export function getStatsByGamePeriod(start: string, end: string): Promise<GameBookingCount[]> {
	return apiFetch<GameBookingCount[]>(
		`/api/v1/bookings/stats/game/period?startPeriod=${start}&endPeriod=${end}`
	);
}

export function getStatsByDay(): Promise<WeekDayBookingCount[]> {
	return apiFetch<WeekDayBookingCount[]>('/api/v1/bookings/stats/day');
}
