type Theme = 'dark' | 'light';

function createThemeStore() {
	let theme = $state<Theme>('dark');

	return {
		get value() {
			return theme;
		},
		get isDark() {
			return theme === 'dark';
		},
		init() {
			if (typeof localStorage === 'undefined') return;
			const saved = localStorage.getItem('tbz_theme') as Theme | null;
			if (saved === 'light' || saved === 'dark') {
				theme = saved;
			}
			applyTheme(theme);
		},
		toggle() {
			theme = theme === 'dark' ? 'light' : 'dark';
			localStorage.setItem('tbz_theme', theme);
			applyTheme(theme);
		},
		set(value: Theme) {
			theme = value;
			localStorage.setItem('tbz_theme', value);
			applyTheme(value);
		}
	};
}

function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;
	if (theme === 'light') {
		document.documentElement.classList.add('light');
	} else {
		document.documentElement.classList.remove('light');
	}
}

export const themeStore = createThemeStore();
