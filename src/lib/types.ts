export interface Booking {
	id: string;
	game: string;
	userId: string;
	username: string;
	points: number;
	description: string;
	status: 'pending' | 'accepted' | 'refused' | 'canceled';
	reminderEnabled: boolean;
	dateTime: string;
	players: string[];
}

export interface DiscordUser {
	userId: string;
	username: string;
	admin: boolean;
}

export interface OAuthToken {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	token_type: string;
}

export interface GameBookingCount {
	game: string;
	bookingCount: number;
}

export interface WeekDayBookingCount {
	dayOfWeek: string;
	bookingCount: number;
}
