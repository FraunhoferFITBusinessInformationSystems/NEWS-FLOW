'use client';

import type { Organisation } from '@/lib/types/user';

const ORGANISATION_OPTIONS: { value: Organisation; label: string }[] = [
	{ value: 'Palmengarten', label: 'Palmengarten' },
	{ value: 'GFA', label: 'GFA' },
];

interface OrganisationSelectProps {
	value?: Organisation;
	onChange: (value: Organisation) => void;
}

export default function OrganisationSelect({
	value,
	onChange,
}: OrganisationSelectProps) {
	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = e.target.value as Organisation;
		onChange(selectedValue);
	};

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="organisation-select" className="text-sm text-gray-600">Organisation:</label>
			<select
				id="organisation-select"
				value={value ?? ''}
				onChange={handleChange}
				className="w-full border border-gray-300 bg-white p-2.5 rounded-lg h-[42px] cursor-pointer hover:border-green-600 hover:bg-green-50/50 focus:ring-2 focus:ring-green-500/40 focus:border-green-600 transition-colors"
			>
				<option value="" disabled>
					Bitte wählen...
				</option>
				{ORGANISATION_OPTIONS.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
