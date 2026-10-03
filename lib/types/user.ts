// Shared types for user organization management
export type Organisation = 'GFA' | 'Palmengarten';

export type UserProfile = {
	id: string;
	organisation: Organisation;
};

// Application-layer user shape. Used wherever a user (e.g. an assignee of a
// watering round) is displayed. Maps the German database columns to English.
export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
}

// Map a raw Supabase "users" row (German column names) to the English User shape.
export function mapUser(raw: any): User {
	return {
		id: raw?.id ?? '',
		firstName: raw?.vorname ?? '',
		lastName: raw?.nachname ?? '',
		email: raw?.email ?? '',
	};
}
