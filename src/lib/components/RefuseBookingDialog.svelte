<script lang="ts">
	import { refuseBooking } from '$lib/api/bookings';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Field, FieldLabel, FieldSet } from '$lib/components/ui/field';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';

	const DEFAULT_REASON = 'Plus de place';

	let {
		open = $bindable(false),
		onRefused,
		bookingId
	}: {
		open?: boolean;
		onRefused?: () => void;
		bookingId: string;
	} = $props();

	let reason = $state(DEFAULT_REASON);
	let otherReason = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);
	let isValid = $derived(!!reason || !!otherReason);

	async function submit() {
		if (submitting || (!reason && !otherReason)) return;
		error = null;
		submitting = true;

		try {
			await refuseBooking(bookingId, reason || otherReason);
			open = false;
			onRefused?.();
			reason = DEFAULT_REASON;
			otherReason = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erreur lors du refus.';
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Refuser une réservation</Dialog.Title>
		</Dialog.Header>

		<FieldSet>
			<!-- Reason -->
			<Field>
				<FieldLabel for="reason">Raison</FieldLabel>
				<Select.Root type="single" bind:value={reason}>
					<Select.Trigger id="reason" class="w-full">
						{reason || 'Sélectionner une raison...'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value={DEFAULT_REASON}>{DEFAULT_REASON}</Select.Item>
						<Select.Item value="Boutique fermée">Boutique fermée</Select.Item>
						<Select.Item value="">Autre</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field>
			{#if reason.length === 0}
				<Field>
					<FieldLabel for="otherReason">Autre</FieldLabel>
					<Textarea
						id="otherReason"
						bind:value={otherReason}
						placeholder="La raison du refus..."
						rows={2}
						callFocus={(el) => el.focus()}
					/>
				</Field>
			{/if}

			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}
		</FieldSet>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
			<Button onclick={submit} disabled={!isValid || submitting} data-testid='dlg-btn-refuse'>
				{submitting ? 'Chargement...' : 'Refuser'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
