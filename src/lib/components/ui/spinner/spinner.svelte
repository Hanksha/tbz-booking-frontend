<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className }: { class?: string } = $props();
</script>

<div class={cn('size-10 animate-spin rounded-full border-3 border-border border-t-primary', className)}></div>
