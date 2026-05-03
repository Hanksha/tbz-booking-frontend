import NewBookingDialog from '$lib/components/NewBookingDialog.svelte';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

vi.mock('$lib/api/bookings', () => ({
	createBooking: vi
		.fn()
		.mockImplementation((booking) => Promise.resolve({ ...booking, id: '123', status: 'pending' })),
	modifyBooking: vi.fn()
}));

describe('NewBookingDialog', () => {
	describe('create mode', () => {
		test('renders the dialog', async () => {
			render(NewBookingDialog, { props: { open: true } });

			await expect.element(page.getByRole('dialog')).toBeInTheDocument();
			await expect.element(page.getByText('Nouvelle réservation')).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Réserver' })).toBeInTheDocument();
			await expect.element(page.getByLabelText('Jeu *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Date *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Heure *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Points')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Joueurs supplémentaires')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Description (optionnel)')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Recevoir un rappel Discord')).toBeInTheDocument();
		});

		test('creates a new booking when the form is submitted', async () => {
			const onCreate = vi.fn();
			vi.setSystemTime(new Date('2026-05-02T13:00:00Z'));
			render(NewBookingDialog, { props: { open: true, onCreate } });

			await page.getByLabelText('Jeu *').click();
			await page.getByRole('option', { name: 'Star Wars Legion' }).click();

			await expect.element(page.getByText('Star Wars Legion')).toBeInTheDocument();

			await page.getByLabelText('Date *').click();
			await page.getByRole('button', { name: 'mardi 5 mai 2026' }).click();

			await page.getByLabelText('Heure *').fill('14:30');

            await page.getByLabelText('Points').fill('1000');
            await page.getByLabelText('Description (optionnel)').fill('A cool game');

            await page.getByRole('button', { name: 'Réserver' }).click();

            vi.waitFor(() => {
                expect(onCreate).toHaveBeenCalledTimes(1);
                expect(onCreate).toHaveBeenCalledWith({
                    id: '123',
                    game: 'Star Wars Legion',
                    date: '2026-05-05T14:30:00.000Z',
                    points: 1000,
                    players: [],
                    description: 'A cool game',
                    remindOnDiscord: false,
                    status: 'pending'
                });
            });
		});
	});
});
