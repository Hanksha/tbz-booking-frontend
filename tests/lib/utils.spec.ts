import { getISOTime } from '$lib/utils';
import { describe, expect, test } from 'vitest';

describe('getISOTime', () => {
	test('returns time part of a ISO date string', () => {
		const date = new Date();
		date.setUTCHours(10);
		date.setUTCMinutes(30);

		expect(getISOTime(date.toISOString())).toBe('10:30');
	});
});
