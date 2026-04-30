export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9090';

export const MAX_TABLES = 4;

export const GAMES: { name: string; logo: string }[] = [
	{ name: 'Warhammer 40k', logo: '/warhammer40k_logo.png' },
	{ name: 'Age of Sigmar', logo: '/aos_logo.png' },
	{ name: 'A Song of Ice and Fire', logo: '/asoiaf_logo.png' },
	{ name: 'Blood Bowl', logo: '/blood_bowl_logo.png' },
	{ name: 'Conquest', logo: '/conquest_logo.png' },
	{ name: 'Warhammer The Horus Heresy', logo: '/hh_logo.png' },
	{ name: 'Infinity', logo: '/infinity_logo.png' },
	{ name: 'Marvel Crisis Protocol', logo: '/mcp_logo.png' },
	{ name: 'Middle-Earth Strategy Battle Game', logo: '/mesbg_logo.png' },
	{ name: 'Star Wars Legion', logo: '/swl_logo.png' },
	{ name: 'Star Wars Shatterpoint', logo: '/sws_logo.png' },
	{ name: 'Warhammer Underworlds', logo: '/whu_logo.png' },
	{ name: 'Warhammer The Old World', logo: '/wtow_logo.png' }
];

export const GAME_LOGO_MAP: Record<string, string> = Object.fromEntries(
	GAMES.map((g) => [g.name, g.logo])
);

export const AVG_GAME_HOURS = 3;

export const BOOKING_CALENDAR_COLORS = {
	lightColors: { main: '#7c3aed', container: '#ede9fe', onContainer: '#3b0764' },
	darkColors: { main: '#a78bfa', container: '#4c1d95', onContainer: '#ede9fe' }
} as const;

export const EVENT_CALENDAR_COLORS = {
	lightColors: { main: '#4f46e5', container: '#e0e7ff', onContainer: '#1e1b4b' },
	darkColors: { main: '#818cf8', container: '#1e1b4b', onContainer: '#e0e7ff' }
} as const;

/** Machine-readable shop hours per weekday. Index 0 = Monday … 6 = Sunday. null = closed. */
export const SHOP_HOURS: ({ open: string; close: string } | null)[] = [
	{ open: '13:00', close: '18:00' }, // Lundi
	{ open: '10:00', close: '18:30' }, // Mardi
	{ open: '10:00', close: '18:30' }, // Mercredi
	{ open: '13:00', close: '18:30' }, // Jeudi
	{ open: '10:00', close: '23:00' }, // Vendredi
	{ open: '10:00', close: '18:00' }, // Samedi
	null // Dimanche
];

export const OPENING_HOURS = [
	{ day: 'Lundi', hours: '13h – 18h' },
	{ day: 'Mardi', hours: '10h – 18h30 Non Stop' },
	{ day: 'Mercredi', hours: '10h – 18h30 Non Stop' },
	{ day: 'Jeudi', hours: '13h – 18h30' },
	{ day: 'Vendredi', hours: '10h – 23h Non Stop' },
	{ day: 'Samedi', hours: '10h – 18h Non Stop' },
	{ day: 'Dimanche', hours: 'Fermé' }
];

export const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(import.meta.env.VITE_DISCORD_REDIRECT_URI ?? '')}&scope=identify+guilds.members.read`;

export const SHOP_NAME = 'Tableraze Montpellier';
