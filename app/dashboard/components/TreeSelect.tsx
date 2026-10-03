'use client';

import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import Select, { type MultiValue, type ActionMeta } from 'react-select';
import { getDistinctBaumIdsByObjekt } from '../action';

interface TreeSelectProps {
	objekt: string | undefined;
	onChange: Dispatch<SetStateAction<string[] | undefined>>;
	selectedBaum?: string[];
}

interface Option {
	value: string;
	label: string;
}

export default function TreeSelect({
	objekt,
	onChange,
	selectedBaum = [],
}: TreeSelectProps) {
	const [options, setOptions] = useState<Option[]>([]);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (objekt) {
			getDistinctBaumIdsByObjekt(objekt).then((data) => {
				const newOptions = data.map((id) => ({
					value: id, // Keep as string since data is now string[]
					label: id, // Keep as string since data is now string[]
				}));
				setOptions(newOptions);
			});
		} else {
			setOptions([]);
			onChange([]);
		}
	}, [objekt, onChange]);

	const normalizedSelectedBaum: Option[] = options.filter((option) =>
		selectedBaum.includes(option.value),
	);

	const handleChange = (
		newValue: MultiValue<Option>,
		actionMeta: ActionMeta<Option>,
	) => {
		const selectedIds = newValue.map((option) => option.value);
		onChange(selectedIds.length > 0 ? selectedIds : []);
	};

	const allSelected =
		normalizedSelectedBaum.length === options.length && options.length > 0;

	const handleSelectAll = () => {
		if (allSelected) {
			onChange([]);
		} else {
			const allIds = options.map((option) => option.value);
			onChange(allIds);
		}
	};

	if (!isClient) {
		return (
			<div className="flex flex-col gap-2">
				<label className="text-sm text-gray-600">Bäume auswählen:</label>
				<div className="w-full h-[150px] rounded border bg-gray-100 animate-pulse" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<label className="text-sm text-gray-600">Baum:</label>
			</div>
			<Select
				isMulti
				options={options}
				value={normalizedSelectedBaum}
				onChange={handleChange}
				isDisabled={!objekt || options.length === 0}
				className="w-full custom-select"
				instanceId="baum-select"
				placeholder="Bäume auswählen..."
				closeMenuOnSelect={false}
				styles={{
					control: (base, state) => ({
						...base,
						minHeight: '42px',
						borderColor: state.isFocused || state.menuIsOpen ? 'rgb(22 163 74)' : 'rgb(209 213 219)',
						boxShadow: state.isFocused || state.menuIsOpen ? '0 0 0 2px rgb(34 197 94 / 0.4)' : 'none',
						cursor: 'pointer',
					}),
				}}
			/>

			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={handleSelectAll}
					className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 
            ${allSelected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
				>
					{allSelected ? 'Alle abwählen' : 'Alle auswählen'}
				</button>
			</div>
		</div>
	);
}
