/**
 * Computes the Levenshtein (edit) distance between two strings.
 *
 * @param a First string.
 * @param b Second string.
 * @returns Minimum number of insert, delete, and substitute operations.
 */
export function getLevenshteinDistance(a: string, b: string): number {
	const matrix: number[][] = [];

	for (let i = 0; i <= b.length; i += 1) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= a.length; j += 1) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= b.length; i += 1) {
		for (let j = 1; j <= a.length; j += 1) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j - 1] + 1,
				);
			}
		}
	}

	return matrix[b.length][a.length];
}

/**
 * Checks if all query characters appear in order within the item (fuzzy sequence match).
 * E.g. "spl" matches "Spielwiese" because s, p, l appear in order.
 *
 * @param query Search query.
 * @param item Item to match against.
 * @returns True if query chars appear in order; false otherwise.
 */
function fuzzySequenceMatches(query: string, item: string): boolean {
	if (query.length === 0) return true;
	let qi = 0;
	for (let i = 0; i < item.length && qi < query.length; i += 1) {
		if (item[i] === query[qi]) {
			qi += 1;
		}
	}
	return qi === query.length;
}

/**
 * Computes the minimum Levenshtein distance between the query and any substring of the item.
 * Handles typos when the user typed a slightly wrong version of a substring.
 *
 * @param query Search query.
 * @param item Item to match against.
 * @param maxEdits Max edits to allow (limits search window).
 * @returns Minimum distance found.
 */
function minSubstringLevenshtein(
	query: string,
	item: string,
	maxEdits: number,
): number {
	let minDist = Infinity;
	const maxWindow = query.length + maxEdits;

	for (let start = 0; start < item.length; start += 1) {
		for (
			let len = Math.max(1, query.length - maxEdits);
			len <= Math.min(maxWindow, item.length - start);
			len += 1
		) {
			const substring = item.slice(start, start + len);
			const dist = getLevenshteinDistance(query, substring);
			minDist = Math.min(minDist, dist);
			if (dist === 0) return 0;
		}
	}
	return minDist;
}

/**
 * Fuzzy filters a list of strings by a search query.
 * Tolerant of typos, missing characters, partial terms, and imperfect spelling.
 * Results are ranked by relevance (exact substring best, then typo matches, then fuzzy sequence).
 *
 * @param query Search query.
 * @param items List of strings to filter.
 * @param limit Maximum number of results to return.
 * @returns Filtered and relevance-sorted list.
 */
export function getFuzzyMatches(
	query: string,
	items: string[],
	limit = 100,
): string[] {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return items;
	}

	// Allow more edits for longer queries; minimum 2 for short queries
	const maxEdits = Math.max(2, Math.ceil(normalizedQuery.length * 0.4));
	const maxAllowedDistance = Math.min(maxEdits, normalizedQuery.length);

	const scored = items.map((item) => {
		const normalizedItem = item.toLowerCase();

		// Exact substring match: best score
		if (normalizedItem.includes(normalizedQuery)) {
			return { item, score: 0 };
		}

		// Starts-with: very good
		if (normalizedItem.startsWith(normalizedQuery)) {
			return { item, score: 0.5 };
		}

		// Sliding-window Levenshtein for typo tolerance (e.g. "spieel" -> "Spielwiese")
		const substringDist = minSubstringLevenshtein(
			normalizedQuery,
			normalizedItem,
			maxEdits,
		);
		if (substringDist <= maxAllowedDistance) {
			return { item, score: 1 + substringDist };
		}

		// Fuzzy sequence: query chars in order (e.g. "spl" -> "Spielwiese")
		// Only for queries with 3+ chars to avoid over-broad matches (e.g. "s")
		if (
			normalizedQuery.length >= 3 &&
			fuzzySequenceMatches(normalizedQuery, normalizedItem)
		) {
			return { item, score: 5 };
		}

		// Full string Levenshtein as fallback for short items
		if (normalizedItem.length <= normalizedQuery.length + maxEdits) {
			const dist = getLevenshteinDistance(normalizedQuery, normalizedItem);
			if (dist <= maxAllowedDistance) {
				return { item, score: 10 + dist };
			}
		}

		return { item, score: Infinity };
	});

	return scored
		.filter((entry) => entry.score < Infinity)
		.sort((a, b) => a.score - b.score)
		.slice(0, limit)
		.map((entry) => entry.item);
}
