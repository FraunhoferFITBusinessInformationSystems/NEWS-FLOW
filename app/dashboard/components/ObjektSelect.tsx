'use client';

import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/components/ui/combobox';
import type { Organisation } from '@/lib/types/user';
import { useEffect, useRef, useState } from 'react';
import { getDistinctObjekte } from '../action';

interface ObjektSelectProps {
	onChange: (value: string) => void;
	selectedStreetObjekt?: string;
	organisation?: Organisation;
}

export default function ObjektSelect({
	onChange,
	selectedStreetObjekt,
	organisation,
}: ObjektSelectProps) {
	const [options, setOptions] = useState<string[]>([]);
	const [selected, setSelected] = useState<string | null>(null);

	// Use ref to avoid dependency issues with onChange callback
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	// Fetch options when organisation changes
	useEffect(() => {
		getDistinctObjekte(organisation).then((data) => {
			setOptions(data);

			// Reset selection if the current selection is not available in new options
			setSelected((currentSelected) => {
				if (currentSelected && !data.includes(currentSelected)) {
					// Schedule callback for after render
					setTimeout(() => onChangeRef.current(''), 0);
					return null;
				}
				// Wenn ein Objekt vorausgewählt werden soll und auch verfügbar ist
				if (selectedStreetObjekt && data.includes(selectedStreetObjekt)) {
					setTimeout(() => onChangeRef.current(selectedStreetObjekt), 0);
					return selectedStreetObjekt;
				}
				return currentSelected;
			});
		});
	}, [organisation, selectedStreetObjekt]);

	const handleValueChange = (value: string | null) => {
		setSelected(value);
		onChange(value ?? '');
	};

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="objekt-select" className="text-sm text-gray-600">Ort:</label>
			<Combobox
				items={options}
				value={selected}
				onValueChange={handleValueChange}
				disabled={!organisation}
			>
				<ComboboxInput
					id="objekt-select"
					name="objekt-select"
					placeholder="Bitte wählen..."
					className="w-full border border-gray-300 bg-white p-2.5 rounded-lg h-[42px] cursor-pointer hover:border-green-600 hover:bg-green-50/50 focus:ring-2 focus:ring-green-500/40 focus:border-green-600 transition-colors"
				/>
				<ComboboxContent>
					<ComboboxEmpty>Keine Ergebnisse gefunden.</ComboboxEmpty>
					<ComboboxList>
						{(item) => (
							<ComboboxItem key={item} value={item}>
								{item}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</div>
	);
}
