'use client';

import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import Select, { type MultiValue, type ActionMeta } from 'react-select';
import { toast } from 'sonner';

interface Option {
	value: number;
	label: string;
}

interface ComparisonYearSelectProps {
	options: Option[];
	selectedYears: number[];
	onChange: Dispatch<SetStateAction<number[]>>;
}

export default function ComparisonYearSelect({
	options,
	selectedYears,
	onChange,
}: ComparisonYearSelectProps) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const normalizedSelected: Option[] = options.filter((option) =>
		selectedYears.includes(option.value),
	);

	const handleChange = (
		newValue: MultiValue<Option>,
		actionMeta: ActionMeta<Option>,
	) => {
		const selected = newValue.map((option) => option.value);

		// Maximal 3 Vergleichsjahre erlauben
		if (selected.length > 3) {
			toast.error('Sie können maximal 3 Vergleichsjahre auswählen.');
			return;
		}

		onChange(selected);
	};

	if (!isClient) {
		return (
			<div className="flex flex-col gap-2">
				<span className="text-sm text-gray-600">Jahre:</span>
				<div className="w-full h-[42px] rounded border bg-gray-100 animate-pulse" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="comparison-year-select" className="text-sm text-gray-600">
				Jahre:
			</label>
			<Select
				inputId="comparison-year-select"
				isMulti
				options={options}
				value={normalizedSelected}
				onChange={handleChange}
				isDisabled={options.length === 0}
				className="w-full custom-select"
				instanceId="comparison-year-select"
				placeholder="Vergleichsjahre auswählen..."
				closeMenuOnSelect={false}
				styles={{
					control: (base, state) => ({
						...base,
						minHeight: '42px',
						borderColor:
							state.isFocused || state.menuIsOpen
								? 'rgb(22 163 74)'
								: 'rgb(209 213 219)',
						boxShadow:
							state.isFocused || state.menuIsOpen
								? '0 0 0 2px rgb(34 197 94 / 0.4)'
								: 'none',
						cursor: 'pointer',
					}),
				}}
			/>

			{selectedYears.length >= 3 && (
				<p className="text-sm text-gray-500">
					Sie können maximal 3 Vergleichsjahre auswählen.
				</p>
			)}
		</div>
	);
}
