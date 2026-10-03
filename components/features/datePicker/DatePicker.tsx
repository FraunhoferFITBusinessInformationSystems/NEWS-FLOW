'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
	startDate?: string;
	endDate?: string;
	onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({
	startDate,
	endDate,
	onChange,
}: Props) {
	// Convert ISO timestamp to date string for HTML input
	const formatForInput = useCallback((isoString?: string) => {
		if (!isoString) return '';
		// Use local time, not the UTC date part of the ISO string
		const d = new Date(isoString);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}, []);

	// Convert date string to full timestamp
	const formatForQuery = (dateString: string, isEndDate = false) => {
		if (!dateString) return '';
		const date = new Date(`${dateString}T00:00:00`); // Parse as local time, not UTC
		if (isEndDate) {
			date.setHours(23, 59, 59, 999); // End of day
		} else {
			date.setHours(0, 0, 0, 0); // Start of day
		}
		const result = date.toISOString();
		return result;
	};

	const [localStart, setLocalStart] = useState(formatForInput(startDate));
	const [localEnd, setLocalEnd] = useState(formatForInput(endDate));
	const focusedField = useRef<'start' | 'end' | null>(null);

	useEffect(() => {
		if (focusedField.current === 'start' || !startDate) return;
		setLocalStart(formatForInput(startDate));
	}, [startDate, formatForInput]);

	useEffect(() => {
		if (focusedField.current === 'end' || !endDate) return;
		setLocalEnd(formatForInput(endDate));
	}, [endDate, formatForInput]);

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="start-date" className="text-sm text-gray-600">
				Startdatum:
			</label>
			<input
				id="start-date"
				type="date"
				className="border border-gray-300 bg-white p-2.5 rounded-lg cursor-pointer hover:border-green-600 hover:bg-green-50/50 focus:ring-2 focus:ring-green-500/40 focus:border-green-600 transition-colors"
				value={localStart}
				onFocus={() => { focusedField.current = 'start'; }}
				onBlur={() => {
					focusedField.current = null;
					if (!startDate) return;
					setLocalStart(formatForInput(startDate));
				}}
				onChange={(e) => {
					const newStart = e.target.value;
					if (!newStart) return;
					setLocalStart(newStart);
					const d = new Date(newStart);
					if (
						d.getFullYear() < 2000 ||
						d.getMonth() + 1 < 1 || d.getMonth() + 1 > 12 ||
						d.getDate() < 1 || d.getDate() > 31
					) return;
					const startTimestamp = formatForQuery(newStart, false);
					const endTimestamp = localEnd ? formatForQuery(localEnd, true) : '';
					if (startTimestamp && endTimestamp) {
						onChange(startTimestamp, endTimestamp);
					}
				}}
			/>

			<label htmlFor="end-date" className="text-sm text-gray-600">
				Enddatum:
			</label>
			<input
				id="end-date"
				type="date"
				className="border border-gray-300 bg-white p-2.5 rounded-lg cursor-pointer hover:border-green-600 hover:bg-green-50/50 focus:ring-2 focus:ring-green-500/40 focus:border-green-600 transition-colors"
				value={localEnd}
				onFocus={() => { focusedField.current = 'end'; }}
				onBlur={() => {
					focusedField.current = null;
					if (!endDate) return;
					setLocalEnd(formatForInput(endDate));
				}}
				onChange={(e) => {
					const newEnd = e.target.value;
					if (!newEnd) return;
					setLocalEnd(newEnd);
					const d = new Date(newEnd);
					if (
						d.getFullYear() < 2000 ||
						d.getMonth() + 1 < 1 || d.getMonth() + 1 > 12 ||
						d.getDate() < 1 || d.getDate() > 31
					) return;
					const startTimestamp = localStart ? formatForQuery(localStart, false) : '';
					const endTimestamp = formatForQuery(newEnd, true);
					if (startTimestamp && endTimestamp) {
						onChange(startTimestamp, endTimestamp);
					}
				}}
			/>
		</div>
	);
}