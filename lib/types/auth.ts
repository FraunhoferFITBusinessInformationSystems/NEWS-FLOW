// Result of the session lookup the layout runs on every navigation.
//
// Keeps apart the two cases a plain role of null cannot distinguish: a visitor
// without any session (the legal pages are served without one) and a signed-in
// account that has no role assigned. Only the second one may see the logout
// button, and only the first one gets offered a login.
export interface AuthState {
	isAuthenticated: boolean;
	role: string | null;
}

export const ANONYMOUS_AUTH_STATE: AuthState = {
	isAuthenticated: false,
	role: null,
};
