'use client';

import { Button } from '@/components/ui/button';
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from '@/components/ui/combobox';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { getDistinctTreeNumbersBySite } from '../action';

interface TreeSelectProps {
	objekt: string | undefined;
	onChange: Dispatch<SetStateAction<string[] | undefined>>;
	selectedBaum?: string[];
}

export default function TreeSelect({
	objekt,
	onChange,
	selectedBaum = [],
}: TreeSelectProps) {
	const [options, setOptions] = useState<string[]>([]);
	// Positions the dropdown under the whole chip field, not only the text input.
	const anchor = useComboboxAnchor();

	useEffect(() => {
		if (objekt) {
			getDistinctTreeNumbersBySite(objekt).then(setOptions);
		} else {
			setOptions([]);
			onChange([]);
		}
	}, [objekt, onChange]);

	// Only tree numbers that exist for the current site count as selected.
	const selectedTreeNumbers = options.filter((treeNumber) =>
		selectedBaum.includes(treeNumber),
	);
	const isDisabled = !objekt || options.length === 0;
	const allSelected =
		selectedTreeNumbers.length === options.length && options.length > 0;

	function handleSelectAll() {
		onChange(allSelected ? [] : options);
	}

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="tree-select" className="text-sm text-gray-600">
				Baum:
			</label>
			<Combobox
				multiple
				items={options}
				value={selectedTreeNumbers}
				onValueChange={(values: string[]) => onChange(values)}
				disabled={isDisabled}
			>
				<ComboboxChips
					ref={anchor}
					className="w-full min-h-[42px] rounded-lg border-gray-300 bg-white cursor-text hover:border-green-600 hover:bg-green-50/50 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-500/40 has-disabled:opacity-50 has-disabled:pointer-events-none transition-colors"
				>
					<ComboboxValue>
						{(values: string[]) => (
							<>
								{values.map((treeNumber) => (
									<ComboboxChip key={treeNumber}>{treeNumber}</ComboboxChip>
								))}
								<ComboboxChipsInput
									id="tree-select"
									placeholder={values.length === 0 ? 'Bäume auswählen...' : ''}
								/>
							</>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxContent anchor={anchor}>
					<ComboboxEmpty>Keine Ergebnisse gefunden.</ComboboxEmpty>
					<ComboboxList>
						{(treeNumber: string) => (
							<ComboboxItem key={treeNumber} value={treeNumber}>
								{treeNumber}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>

			<div className="flex items-center justify-between">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleSelectAll}
					disabled={isDisabled}
				>
					{allSelected ? 'Alle abwählen' : 'Alle auswählen'}
				</Button>
			</div>
		</div>
	);
}
