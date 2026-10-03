'use client';

import { signOut } from '@/app/auth/login/action';
import { MobileNav } from '@/components/layout/mobile-nav';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { type NavigationItem, cn } from '@/lib/utils';
import { HelpCircle, LogIn, LogOut, User } from 'lucide-react';
import Link from 'next/link';

interface AppHeaderProps {
	navigationItems: NavigationItem[];
	isAuthenticated: boolean;
	showAuthButton: boolean;
	isLoading: boolean;
}

// Session control in the header. Anonymous visitors reach the header on the
// pages that are served without a login (Impressum, Datenschutz), so there the
// button has to offer a way in rather than a way out. A signed-in account
// without a role still gets the logout button, which is what /no-role needs.
function AuthButton({
	isAuthenticated,
	className,
}: {
	isAuthenticated: boolean;
	className: string;
}) {
	if (!isAuthenticated) {
		return (
			<Link href="/auth/login" className={className}>
				<LogIn className="size-4" />
				Anmelden
			</Link>
		);
	}

	return (
		<form action={signOut} className="flex items-center h-full">
			<button type="submit" className={className}>
				<LogOut className="size-4" />
				Abmelden
			</button>
		</form>
	);
}

// Fixed header bar. Purely presentational: what may be shown is decided by the
// shell, which owns the role. While the role is still being resolved the bar
// holds nothing but a spinner, because both the navigation and the session
// control depend on it.
export function AppHeader({
	navigationItems,
	isAuthenticated,
	showAuthButton,
	isLoading,
}: AppHeaderProps) {
	return (
		<header className="fixed top-0 left-0 right-0 z-[1100] bg-white border-b shadow-sm">
			<div className="w-full px-4 sm:px-6 lg:px-8">
				<div
					className={cn(
						'flex h-16 items-center max-w-7xl mx-auto',
						isLoading ? 'justify-center' : 'justify-between',
					)}
				>
					{isLoading ? (
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
					) : (
						<>
							{/* Mobile navigation, empty and therefore pointless without a session */}
							{isAuthenticated && (
								<MobileNav navigationItems={navigationItems} />
							)}

							{/* Desktop navigation */}
							<NavigationMenu
								className="hidden min-[1400px]:flex w-full"
								viewport={false}
							>
								<NavigationMenuList className="flex w-full">
									{/* Dynamic navigation items */}
									{navigationItems.map((item) => {
										const key = item.href ?? item.label;
										if (item.children && item.children.length > 0) {
											const sortedChildren = [...item.children].sort((a, b) =>
												a.label.localeCompare(b.label),
											);
											return (
												<NavigationMenuItem key={key} className="relative">
													<NavigationMenuTrigger className="min-h-[44px] px-4 py-2 text-sm font-medium text-green-800 hover:text-green-900 hover:bg-green-50 data-[state=open]:bg-green-50 data-[state=open]:text-green-900 [&_svg]:text-green-800">
														{item.label}
													</NavigationMenuTrigger>
													<NavigationMenuContent className="left-0 right-auto min-w-[180px] bg-white border border-gray-200">
														<ul className="grid w-[180px] gap-1 p-2">
															{sortedChildren.map((child) => (
																<li key={child.href}>
																	<NavigationMenuLink asChild>
																		<Link
																			href={child.href}
																			className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-green-800 hover:bg-green-50 hover:text-green-900"
																		>
																			{child.label}
																		</Link>
																	</NavigationMenuLink>
																</li>
															))}
														</ul>
													</NavigationMenuContent>
												</NavigationMenuItem>
											);
										}
										return (
											<NavigationMenuItem key={key}>
												<NavigationMenuLink
													asChild
													className={cn(
														navigationMenuTriggerStyle(),
														'flex flex-row items-center gap-2 text-green-800 hover:text-green-900 hover:bg-green-50 data-[state=open]:bg-green-50 [&_svg]:text-green-800',
													)}
												>
													<Link
														href={item.href!}
														className="min-h-[44px] px-4 py-2 text-sm font-medium flex items-center gap-2"
													>
														{item.iconOnly ? (
															<HelpCircle
																className="size-5 shrink-0 text-green-800"
																aria-label="Hilfe"
															/>
														) : item.icon === 'user' ? (
															<>
																<User className="size-4 shrink-0 text-green-800" />
																{item.label}
															</>
														) : (
															item.label
														)}
													</Link>
												</NavigationMenuLink>
											</NavigationMenuItem>
										);
									})}

									{/* Right-aligned session control */}
									{showAuthButton && (
										<NavigationMenuItem className="ml-auto">
											<AuthButton
												isAuthenticated={isAuthenticated}
												className={`${navigationMenuTriggerStyle()} min-h-[44px] px-4 py-2 text-sm font-medium touch-manipulation flex items-center gap-2 text-green-800 hover:text-green-900 hover:bg-green-50 [&_svg]:text-green-800`}
											/>
										</NavigationMenuItem>
									)}
								</NavigationMenuList>
							</NavigationMenu>

							{/* Session control for smaller screens */}
							{showAuthButton && (
								<div className="min-[1400px]:hidden ml-auto">
									<AuthButton
										isAuthenticated={isAuthenticated}
										className="min-h-[44px] px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors touch-manipulation flex items-center gap-2 text-green-800 [&_svg]:text-green-800"
									/>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</header>
	);
}
