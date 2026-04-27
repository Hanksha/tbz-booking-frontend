import { CalendarDays, BookOpen, BarChart2 } from '@lucide/svelte';

export const navLinks = [
	{ href: '/reservations', label: 'Réservations', shortLabel: 'Résas', icon: CalendarDays },
	{ href: '/mes-reservations', label: 'Mes réservations', shortLabel: 'Mes résas', icon: BookOpen },
	{ href: '/statistiques', label: 'Statistiques', shortLabel: 'Stats', icon: BarChart2 }
];
