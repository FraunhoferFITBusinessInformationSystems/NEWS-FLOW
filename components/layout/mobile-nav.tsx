'use client';

import { signOut } from '@/app/auth/login/action';
import { Button } from '@/components/ui/button';
import type { NavigationItem } from '@/lib/utils';
import { ChevronDown, HelpCircle, LogOut, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface MobileNavProps {
	navigationItems: NavigationItem[];
}

export function MobileNav({ navigationItems }: MobileNavProps) {
	const [open, setOpen] = useState(false);
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
		{},
	);

	function closeMenu() {
		setOpen(false);
	}

	function toggleGroup(label: string) {
		setExpandedGroups((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	}

	return (
		<>
			{/* Mobile menu button */}
			<Button
				variant="ghost"
				className="min-[1400px]:hidden h-11 w-11 p-0 touch-manipulation text-green-800 hover:bg-green-50 hover:text-green-900"
				size="sm"
				onClick={() => setOpen(!open)}
			>
				{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				<span className="sr-only">Menü öffnen</span>
			</Button>

			{/* Mobile menu overlay */}
			{open && (
				<div
					className="fixed inset-0 bg-black/50 min-[1400px]:hidden"
					onClick={closeMenu}
					onKeyDown={(e) => {
						if (e.key === 'Escape') closeMenu();
					}}
					role="button"
					tabIndex={0}
					aria-label="Close mobile menu"
				/>
			)}

			{/* Mobile menu content */}
			<div
				className={`fixed top-0 left-0 flex h-full w-80 max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out min-[1400px]:hidden ${
					open ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
					<h2 className="text-lg font-semibold">Navigation</h2>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={closeMenu}
					>
						<X className="h-5 w-5" />
					</Button>
				</div>

				<nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
					{navigationItems.map((item) => {
						const hasChildren = Boolean(item.children?.length);

						if (hasChildren && item.children) {
							const isExpanded = Boolean(expandedGroups[item.label]);
							const sortedChildren = [...item.children].sort((a, b) =>
								a.label.localeCompare(b.label, 'de'),
							);

							return (
								<div key={item.label} className="rounded-lg">
									<button
										type="button"
										onClick={() => toggleGroup(item.label)}
										aria-expanded={isExpanded}
										className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-base font-medium text-green-800 touch-manipulation transition-colors hover:bg-green-50"
									>
										<span>{item.label}</span>
										<ChevronDown
											className={`size-4 shrink-0 transition-transform ${
												isExpanded ? 'rotate-180' : ''
											}`}
										/>
									</button>
									{isExpanded && (
										<div className="mb-1 ml-2 space-y-1 border-l border-green-100 pl-2">
											{sortedChildren.map((child) => (
												<Link
													key={child.href}
													href={child.href}
													onClick={closeMenu}
													className="flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium text-green-800 touch-manipulation transition-colors hover:bg-green-50"
												>
													{child.label}
												</Link>
											))}
										</div>
									)}
								</div>
							);
						}

						if (!item.href) return null;

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={closeMenu}
								className="flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-3 text-base font-medium text-green-800 touch-manipulation transition-colors hover:bg-green-50 [&_svg]:text-green-800"
							>
								{item.iconOnly ? (
									<>
										<HelpCircle className="size-5" />
										<span>{item.label}</span>
									</>
								) : item.icon === 'user' ? (
									<>
										<User className="size-4" />
										<span>{item.label}</span>
									</>
								) : (
									item.label
								)}
							</Link>
						);
					})}

					<div className="mt-auto border-t pt-4">
						<form action={signOut}>
							<Button
								type="submit"
								variant="outline"
								className="flex min-h-[44px] w-full items-center justify-center gap-2 text-base touch-manipulation text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 [&_svg]:text-green-800"
								onClick={closeMenu}
							>
								<LogOut className="size-4" />
								Abmelden
							</Button>
						</form>
					</div>
				</nav>
			</div>
		</>
	);
}
