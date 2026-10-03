export function getStatusColor(
	ist: number | null | undefined,
	soll: number | null | undefined,
): string {
	if (ist == null || ist === undefined || ist === 0) {
		return 'rgb(128, 128, 128)';
	}
	
	if (soll == null || soll === undefined || soll === 0) {
		return 'rgb(0, 0, 255)';
	}

	const abweichung = Math.abs(ist - soll);
	const abweichungProzent = Math.abs((ist - soll) / soll) * 100;

	let r = 0;
	let g = 0;
	let b = 0;

	// Grün: Der IST-Wert liegt mindestens 10 % unter dem maximal erlaubten SOLL-Wert
	if (ist <= soll * 0.9) {
		r = 0;
		g = 200;
		b = 0; // Grün
	}

	// Gelb: Der IST-Wert weicht höchstens 20 % vom SOLL ab (mindestens 20 kPa Differenz)
	// Use the LARGER of: 20% of SOLL OR 20 kPa absolute
	else if (abweichung <= Math.max(soll * 0.2, 20)) {
		r = 255;
		g = 204;
		b = 0; // Gelb
	}

	// Orange: Die Abweichung beträgt höchstens 30 % vom SOLL (mindestens 40 kPa Differenz)
	// Use the LARGER of: 30% of SOLL OR 40 kPa absolute
	else if (abweichung <= Math.max(soll * 0.3, 40)) {
		r = 255;
		g = 128;
		b = 0; // Orange
	}

	// Rot: Die Abweichung ist größer als in den genannten Bereichen
	else {
		r = 255;
		g = 0;
		b = 0; // Rot
	}

	return `rgb(${r},${g},${b})`;
}
