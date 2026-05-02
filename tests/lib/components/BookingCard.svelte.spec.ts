import { refuseBooking } from '$lib/api/bookings';
import BookingCard from '$lib/components/BookingCard.svelte';
import { auth } from '$lib/stores/auth.svelte';
import type { Booking } from '$lib/types';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

vi.mock('$lib/api/bookings', () => ({
	refuseBooking: vi.fn()
}));

describe('BookingCard', () => {
	const booking: Booking = {
		id: '1',
		game: 'Warhammer 40k',
		description: 'Test de réservation',
		points: 2000,
		players: ['Jean Pierre', 'Patrick'],
		status: 'accepted',
		userId: 'jeanpierre1989',
		username: 'jp',
		dateTime: '2026-05-01T15:00:00.000Z',
		reminderEnabled: true
	};

	test('renders booking card', async () => {
		render(BookingCard, { booking });

		await expect.element(page.getByText('Warhammer 40k')).toBeInTheDocument();
		await expect.element(page.getByText('2000 pts · 15:00 · 3 joueurs')).toBeInTheDocument();
		await expect.element(page.getByText('Organisé par')).toBeInTheDocument();
		await expect.element(page.getByText('Jean Pierre')).toBeInTheDocument();
		await expect.element(page.getByText('Avec : Jean Pierre, Patrick')).toBeInTheDocument();
		await expect.element(page.getByText('Test de réservation')).toBeInTheDocument();
		await expect.element(page.getByText('Acceptée')).toBeInTheDocument();
		await expect.element(page.getByRole('img')).toBeInTheDocument();
	});

	describe('admin user', () => {
		beforeEach(() => {
			vi.clearAllMocks();
			vi.spyOn(auth, 'user', 'get').mockReturnValue({
				admin: true,
				userId: '1',
				username: 'admin'
			});
		});

		test('renders accept button if onAccept prop is present and status is pending', async () => {
			render(BookingCard, { booking: { ...booking, status: 'pending' }, onAccept: vi.fn() });

			await expect.element(page.getByText('Accepter')).toBeInTheDocument();
			await expect.element(page.getByText('Refuser')).not.toBeInTheDocument();
			await expect.element(page.getByText('Modifier')).not.toBeInTheDocument();
		});

		test('does not renders accept button if and status is not pending', async () => {
			render(BookingCard, { booking: { ...booking, status: 'accepted' }, onAccept: vi.fn() });

			await expect.element(page.getByText('Accepter')).not.toBeInTheDocument();
		});

		test('does not renders refuse button if and status is not pending', async () => {
			render(BookingCard, { booking: { ...booking, status: 'accepted' }, onRefuse: vi.fn() });

			await expect.element(page.getByText('Refuser')).not.toBeInTheDocument();
		});

		test('renders refuse button if onRefuse prop is present and status is pending', async () => {
			render(BookingCard, { booking: { ...booking, status: 'pending' }, onRefuse: vi.fn() });

			await expect.element(page.getByText('Refuser')).toBeInTheDocument();
			await expect.element(page.getByText('Accepter')).not.toBeInTheDocument();
			await expect.element(page.getByText('Modifier')).not.toBeInTheDocument();
		});

		test('calls onAccept when accept button is clicked', async () => {
			const mockOnAccept = vi.fn();
			render(BookingCard, { booking: { ...booking, status: 'pending' }, onAccept: mockOnAccept });

			await page.getByRole('button', { hasText: 'Accepter' }).click();

			expect(mockOnAccept).toHaveBeenCalledTimes(1);
			expect(mockOnAccept).toHaveBeenCalledWith('1');
		});

		test('calls onRefuse when refuse button is clicked', async () => {
			const mockOnRefuse = vi.fn();
			render(BookingCard, { booking: { ...booking, status: 'pending' }, onRefuse: mockOnRefuse });

			await page.getByRole('button', { hasText: 'Refuser' }).click();

			await expect.element(page.getByText('Refuser une réservation')).toBeInTheDocument();

			await page.getByTestId('dlg-btn-refuse').click();

			expect(refuseBooking).toHaveBeenCalledTimes(1);
			expect(mockOnRefuse).toHaveBeenCalledTimes(1);
			expect(mockOnRefuse).toHaveBeenCalledWith('1');
		});
	});

	describe('non-admin user', () => {
		beforeEach(() => {
			vi.clearAllMocks();
			vi.spyOn(auth, 'user', 'get').mockReturnValue({
				admin: false,
				userId: '1',
				username: 'user'
			});
		});

		test('does not render accept and refuse buttons', async () => {
			render(BookingCard, {
				booking: { ...booking, status: 'pending' },
				onAccept: vi.fn(),
				onRefuse: vi.fn()
			});

			await expect.element(page.getByText('Accepter')).not.toBeInTheDocument();
			await expect.element(page.getByText('Refuser')).not.toBeInTheDocument();
			await expect.element(page.getByText('Modifier')).not.toBeInTheDocument();
		});

		test('renders modify button if onModify prop is present and user is the owner of the booking', async () => {
			render(BookingCard, {
				booking: { ...booking, userId: '1', username: 'user', status: 'pending' },
				onModify: vi.fn()
			});

			await expect.element(page.getByText('Modifier')).toBeInTheDocument();
			await expect.element(page.getByText('Accepter')).not.toBeInTheDocument();
			await expect.element(page.getByText('Refuser')).not.toBeInTheDocument();
		});

		test('does not render modify button if user is not the owner of the booking', async () => {
			render(BookingCard, {
				booking: { ...booking, userId: '2', status: 'pending' },
				onModify: vi.fn()
			});

			await expect.element(page.getByText('Modifier')).not.toBeInTheDocument();
		});

		test('calls onModify when modify button is clicked', async () => {
			const mockOnModify = vi.fn();
			render(BookingCard, {
				booking: { ...booking, userId: '1', username: 'user', status: 'pending' },
				onModify: mockOnModify
			});

			await page.getByText('Modifier').click();

			expect(mockOnModify).toHaveBeenCalledTimes(1);
		});
	});
});
