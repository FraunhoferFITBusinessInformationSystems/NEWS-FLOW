'use client';

import { getAuthStateAction } from '@/lib/actions/auth';
import { ANONYMOUS_AUTH_STATE, type AuthState } from '@/lib/types/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';

interface UserRoleContextType {
	userRole: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	refreshUserRole: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(
	undefined,
);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>(ANONYMOUS_AUTH_STATE);
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	const refreshUserRole = useCallback(async () => {
		setIsLoading(true);
		try {
			// Add a small delay to ensure auth state is ready
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Use server action for authentication
			setAuthState(await getAuthStateAction());
		} catch (error) {
			// Treat an unreachable auth state as no session: the header then offers
			// a login instead of a logout that could not work anyway.
			console.error(
				`Fehler in refreshUserRole: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			setAuthState(ANONYMOUS_AUTH_STATE);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Initial load
	useEffect(() => {
		if (!isInitialized) {
			refreshUserRole().then(() => setIsInitialized(true));
		}
	}, [refreshUserRole, isInitialized]);

	// Check for refresh parameter after login
	useEffect(() => {
		const shouldRefresh = searchParams.get('refresh');
		if (shouldRefresh === 'true' && isInitialized) {
			// Remove the refresh parameter from URL without triggering navigation
			const url = new URL(window.location.href);
			url.searchParams.delete('refresh');
			window.history.replaceState({}, '', url.toString());

''			// Refresh user role with longer delay after login
			//setTimeout(() => {
			//	refreshUserRole();
			//}, 10);''
			refreshUserRole();
		}
	}, [searchParams, refreshUserRole, isInitialized]);

	return (
		<UserRoleContext.Provider
			value={{
				userRole: authState.role,
				isAuthenticated: authState.isAuthenticated,
				isLoading,
				refreshUserRole,
			}}
		>
			{children}
		</UserRoleContext.Provider>
	);
}

export function useUserRole() {
	const context = useContext(UserRoleContext);
	if (context === undefined) {
		throw new Error('useUserRole must be used within a UserRoleProvider');
	}
	return context;
}
