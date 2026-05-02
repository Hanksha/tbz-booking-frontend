import type { Booking } from '$lib/types';
import { apiFetch } from './client';

export async function getActiveBookings(): Promise<Booking[]> {
	const bookings = await apiFetch<Booking[]>('/api/v1/bookings');
	return bookings || [];
}

export function getMyBookings(username: string): Promise<Booking[]> {
	return apiFetch<Booking[]>(`/api/v1/bookings/${encodeURIComponent(username)}`);
}

export function createBooking(booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> {
	return apiFetch<Booking>('/api/v1/bookings', {
		method: 'POST',
		body: JSON.stringify(booking)
	});
}

export function modifyBooking(id: string, booking: Partial<Booking>): Promise<void> {
	return apiFetch<void>(`/api/v1/bookings/${id}/modify`, {
		method: 'PUT',
		body: JSON.stringify(booking)
	});
}

export function acceptBooking(id: string): Promise<void> {
	return apiFetch<void>(`/api/v1/bookings/${id}/accept`, { method: 'PUT' });
}

export function refuseBooking(id: string, reason?: string): Promise<void> {
	const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
	return apiFetch<void>(`/api/v1/bookings/${id}/refuse${query}`, { method: 'PUT' });
}

export function cancelBooking(id: string): Promise<void> {
	return apiFetch<void>(`/api/v1/bookings/${id}/cancel`, { method: 'PUT' });
}
