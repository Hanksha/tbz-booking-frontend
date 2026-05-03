import { refuseBooking } from '$lib/api/bookings';
import RefuseBookingDialog from '$lib/components/RefuseBookingDialog.svelte';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

vi.mock('$lib/api/bookings', () => ({
	refuseBooking: vi.fn().mockResolvedValue(undefined)
}));

describe('RefuseBookingDialog', () => {
	test('renders the refuse booking dialog', async () => {
		render(RefuseBookingDialog, { props: { bookingId: '123', open: true } });

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();
		await expect.element(page.getByText('Refuser une réservation')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Refuser' })).toBeInTheDocument();
		await expect.element(page.getByLabelText('Raison')).toBeInTheDocument();
	});

	test('should close the dialog when cancel button is clicked', async () => {
		render(RefuseBookingDialog, { props: { bookingId: '123', open: true } });

		await page.getByRole('button', { name: 'Annuler' }).click();
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	test('calls onRefuse callback when refuse button is clicked', async () => {
		const onRefuse = vi.fn();
		render(RefuseBookingDialog, { props: { bookingId: '123', open: true, onRefuse } });

		await page.getByLabelText('Raison').click();
		await page.getByRole('option', { name: 'Plus de place' }).click();
		await page.getByRole('button', { name: 'Refuser' }).click();

		vi.waitFor(() => {
			expect(onRefuse).toHaveBeenCalledTimes(1);
			expect(refuseBooking).toHaveBeenCalledWith('123', 'Plus de place');
		});
	});
    
    test('calls onRefuse callback when refuse button is clicked with custom reason', async () => {
		const onRefuse = vi.fn();
		render(RefuseBookingDialog, { props: { bookingId: '123', open: true, onRefuse } });

		await page.getByLabelText('Raison').click();
		await page.getByRole('option', { name: 'Autre' }).click();

        await vi.waitFor(async () => {
            await expect.element(page.getByRole('button', { name: 'Refuser' })).toBeDisabled();
        });

		await page.getByLabelText('Autre').fill('Raison personnalisée');
		await page.getByRole('button', { name: 'Refuser' }).click();

		vi.waitFor(() => {
			expect(onRefuse).toHaveBeenCalledTimes(1);
			expect(refuseBooking).toHaveBeenCalledWith('123', 'Raison personnalisée');
		});
	});
});
