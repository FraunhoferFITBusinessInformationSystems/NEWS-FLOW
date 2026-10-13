'use client';

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
import type { ComparisonYearOption } from '@/lib/types/dashboard';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

const MAX_COMPARISON_YEARS = 3;

interface ComparisonYearSelectProps {
	options: ComparisonYearOption[];
	selectedYears: number[];
	onChange: Dispatch<SetStateAction<number[]>>;
}

export default function ComparisonYearSelect({
	options,
	selectedYears,
	onChange,
}: ComparisonYearSelectProps) {
	// Positions the dropdown under the whole chip field, not only the text input.
	const anchor = useComboboxAnchor();
	const years = options.map((option) => option.value);
	// Only years that are still offered count as selected.
	const selected = years.filter((year) => selectedYears.includes(year));

	// Chips and list show the label, e.g. "24/25" for a range across New Year.
	function yearToLabel(year: number): string {
		return (
			options.find((option) => option.value === year)?.label ?? String(year)
		);
	}

	function handleValueChange(values: number[]) {
		if (values.length > MAX_COMPARISON_YEARS) {
			toast.error('Sie können maximal 3 Vergleichsjahre auswählen.');
			return;
		}
		onChange(values);
	}

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="comparison-year-select" className="text-sm text-gray-600">
				Jahre:
			</label>
			<Combobox
				multiple
				items={years}
				value={selected}
				onValueChange={handleValueChange}
				itemToStringLabel={yearToLabel}
				disabled={options.length === 0}
			>
				<ComboboxChips
					ref={anchor}
					className="w-full min-h-[42px] rounded-lg border-gray-300 bg-white cursor-text hover:border-green-600 hover:bg-green-50/50 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-500/40 has-disabled:opacity-50 has-disabled:pointer-events-none transition-colors"
				>
					<ComboboxValue>
						{(values: number[]) => (
							<>
								{values.map((year) => (
									<ComboboxChip key={year}>{yearToLabel(year)}</ComboboxChip>
								))}
								<ComboboxChipsInput
									id="comparison-year-select"
									placeholder={
										values.length === 0 ? 'Vergleichsjahre auswählen...' : ''
									}
								/>
							</>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxContent anchor={anchor}>
					<ComboboxEmpty>Keine Ergebnisse gefunden.</ComboboxEmpty>
					<ComboboxList>
						{(year: number) => (
							<ComboboxItem key={year} value={year}>
								{yearToLabel(year)}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>

			{selectedYears.length >= MAX_COMPARISON_YEARS && (
				<p className="text-sm text-gray-500">
					Sie können maximal 3 Vergleichsjahre auswählen.
				</p>
			)}
		</div>
	);
}
