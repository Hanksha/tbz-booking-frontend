import type { DiscordEvent } from '$lib/types';
import { apiFetch } from './client';

export function searchUsers(query: string): Promise<string[]> {
	return apiFetch<string[]>(`/api/discord/user/search?query=${encodeURIComponent(query)}`);
}

interface RawEvent {
	id: string;
	name: string;
	description?: string;
	scheduled_start_time: string;
	scheduled_end_time: string;
	status: 1;
}

export async function getEvents(): Promise<DiscordEvent[]> {
	const rawEvents = await apiFetch<RawEvent[]>('/api/discord/events');
	return rawEvents.map((raw) => ({
		id: raw.id,
		name: raw.name,
		description: raw.description,
		startTime: Temporal.Instant.from(raw.scheduled_start_time),
		endTime: raw.scheduled_end_time ? Temporal.Instant.from(raw.scheduled_end_time) : undefined,
		status: getStatus(raw.status)
	}));
}

function getStatus(status: number): DiscordEvent['status'] {
	switch (status) {
		case 1:
			return 'scheduled';
		case 2:
			return 'active';
		case 3:
			return 'completed';
		case 4:
			return 'canceled';
		default:
			throw Error('unknown status number ' + status);
	}
}
