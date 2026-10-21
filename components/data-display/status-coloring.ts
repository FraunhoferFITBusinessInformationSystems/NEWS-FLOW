/**
 * Colour for one depth, comparing the current soil water tension with the
 * target maximum (both in kPa). Returns an `rgb(...)` string: grey without a
 * current value, blue without a target, otherwise green, yellow, orange or
 * red by deviation. The thresholds are explained on the help page (/hilfe).
 */
export function getStatusColor(
	current: number | null | undefined,
	target: number | null | undefined,
): string {
	if (current == null || current === undefined || current === 0) {
		return 'rgb(128, 128, 128)';
	}

	if (target == null || target === undefined || target === 0) {
		return 'rgb(0, 0, 255)';
	}

	const deviation = Math.abs(current - target);

	let r = 0;
	let g = 0;
	let b = 0;

	// Green: the current value is at least 10 % below the maximum allowed target
	if (current <= target * 0.9) {
		r = 0;
		g = 200;
		b = 0;
	}

	// Yellow: deviation of at most 20 % of the target or 20 kPa, whichever is larger
	else if (deviation <= Math.max(target * 0.2, 20)) {
		r = 255;
		g = 204;
		b = 0;
	}

	// Orange: deviation of at most 30 % of the target or 40 kPa, whichever is larger
	else if (deviation <= Math.max(target * 0.3, 40)) {
		r = 255;
		g = 128;
		b = 0;
	}

	// Red: deviation larger than in the ranges above
	else {
		r = 255;
		g = 0;
		b = 0;
	}

	return `rgb(${r},${g},${b})`;
}
