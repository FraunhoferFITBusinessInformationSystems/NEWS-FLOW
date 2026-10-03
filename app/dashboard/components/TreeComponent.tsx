'use client';

/**
 * TreeComponent: Wrapper für Single-Tree-Ansicht.
 * Zeigt nur TreeSpecificContent (Zustand, Baumdaten, Notizen, Neue Notiz).
 * SharedSections (Wetter, Bewässerung) werden separat in eigenem Kasten gerendert.
 */
import type { IstZustandData, SollZustandData, TreeOverview } from '@/lib/types/dashboard';
import { useEffect, useState } from 'react';
import { getUserOrganisation } from '../action';
import TreeSpecificContent from './TreeSpecificContent';

interface TreeComponentProps {
	treeId: string;
	istZustandData?: IstZustandData;
	sollZustandData?: SollZustandData;
	lastData?: Date | undefined;
	treeOverview?: TreeOverview | null;
}

export default function TreeComponent({
	treeId,
	istZustandData,
	sollZustandData,
	lastData,
	treeOverview,
}: TreeComponentProps) {
	const [userOrg, setUserOrg] = useState('');

	useEffect(() => {
		getUserOrganisation().then(setUserOrg);
	}, []);

	if (!treeOverview) return null;

	return (
		<div className="space-y-6">
			<TreeSpecificContent
				treeId={treeId}
				treeOverview={treeOverview}
				istZustandData={istZustandData}
				sollZustandData={sollZustandData}
				lastData={lastData}
				userOrg={userOrg}
			/>
		</div>
	);
}
