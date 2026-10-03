'use server';

import { createClient } from '@/lib/supabase/server';
import { isPalmengartenTree } from '@/lib/utils';

// Types for strategy data
export type StrategieValues = {
	strategie_30cm_max: number | null;
	strategie_60cm_max: number | null;
	strategie_90cm_max: number | null;
	schwellenwert_gelb: number | null;
	schwellenwert_orange: number | null;
	schwellenwert_rot: number | null;
	bewaesserung_liter: number | null;
};

export type TreeWithTargetValues = {
	sollwert_30cm: number | null;
	sollwert_60cm: number | null;
	sollwert_90cm: number | null;
};

/**
 * Get target values (Sollwerte) for a tree based on its characteristics
 * - For GFA trees (bezirk !== 'Palmengarten'): uses standalter from bewaesserungsstrategien_gfa
 * - For Palmengarten trees (bezirk === 'Palmengarten'): uses objekt from bewaesserungsstrategien_pg
 */
export async function getTreeTargetValues(tree: {
	bezirk?: string | null;
	standalter?: number | null;
	objekt?: string | null;
}): Promise<TreeWithTargetValues> {
	const supabase = await createClient();

	const defaultValues: TreeWithTargetValues = {
		sollwert_30cm: null,
		sollwert_60cm: null,
		sollwert_90cm: null,
	};

	try {
		if (isPalmengartenTree(tree.bezirk)) {
			// Palmengarten tree - use objekt to look up in bewaesserungsstrategien_pg
			if (!tree.objekt) {
				console.warn('Palmengarten tree missing objekt field');
				return defaultValues;
			}

			const { data, error } = await supabase
				.from('bewaesserungsstrategien_pg')
				.select('strategie_30cm_max, strategie_60cm_max, strategie_90cm_max')
				.eq('objekt', tree.objekt)
				.single();

			if (error) {
				console.warn(
					`No strategy found for Palmengarten objekt: ${tree.objekt}`,
				);
				return defaultValues;
			}

			return {
				sollwert_30cm: data.strategie_30cm_max,
				sollwert_60cm: data.strategie_60cm_max,
				sollwert_90cm: data.strategie_90cm_max,
			};
		}

		// GFA tree - use standalter to look up in bewaesserungsstrategien_gfa
		if (tree.standalter === null || tree.standalter === undefined) {
			console.warn('GFA tree missing standalter field');
			return defaultValues;
		}

		const { data, error } = await supabase
			.from('bewaesserungsstrategien_gfa')
			.select('strategie_30cm_max, strategie_60cm_max, strategie_90cm_max')
			.eq('standalter', tree.standalter)
			.single();

		if (error) {
			console.warn(`No strategy found for GFA standalter: ${tree.standalter}`);
			return defaultValues;
		}

		return {
			sollwert_30cm: data.strategie_30cm_max,
			sollwert_60cm: data.strategie_60cm_max,
			sollwert_90cm: data.strategie_90cm_max,
		};
	} catch (error) {
		console.error('Error fetching tree target values:', error);
		return defaultValues;
	}
}

/**
 * Batch function to get target values for multiple trees efficiently
 * Groups trees by type (GFA vs Palmengarten) and fetches strategies in bulk
 */
export async function getMultipleTreeTargetValues<
	T extends {
		bezirk?: string | null;
		standalter?: number | null;
		objekt?: string | null;
	},
>(trees: T[]): Promise<(T & TreeWithTargetValues)[]> {
	const supabase = await createClient();

	// Separate trees by type
	const palmengartenTrees = trees.filter((tree) =>
		isPalmengartenTree(tree.bezirk),
	);
	const gfaTrees = trees.filter((tree) => !isPalmengartenTree(tree.bezirk));

	// Fetch strategies for Palmengarten trees
	const palmengartenObjekte = [
		...new Set(
			palmengartenTrees
				.map((t) => t.objekt)
				.filter((obj): obj is string => obj !== null && obj !== undefined),
		),
	];
	let pgStrategies: Record<string, StrategieValues> = {};

	if (palmengartenObjekte.length > 0) {
		const { data: pgData, error: pgError } = await supabase
			.from('bewaesserungsstrategien_pg')
			.select('*')
			.in('objekt', palmengartenObjekte);

		if (!pgError && pgData) {
			pgStrategies = Object.fromEntries(
				pgData.map((strategy) => [strategy.objekt, strategy]),
			);
		}
	}

	// Fetch strategies for GFA trees
	const gfaStandalter = [
		...new Set(
			gfaTrees
				.map((t) => t.standalter)
				.filter((age): age is number => age !== null && age !== undefined),
		),
	];
	let gfaStrategies: Record<number, StrategieValues> = {};

	if (gfaStandalter.length > 0) {
		const { data: gfaData, error: gfaError } = await supabase
			.from('bewaesserungsstrategien_gfa')
			.select('*')
			.in('standalter', gfaStandalter);

		if (!gfaError && gfaData) {
			gfaStrategies = Object.fromEntries(
				gfaData.map((strategy) => [strategy.standalter, strategy]),
			);
		}
	}

	// Map trees with their target values
	return trees.map((tree) => {
		const defaultValues: TreeWithTargetValues = {
			sollwert_30cm: null,
			sollwert_60cm: null,
			sollwert_90cm: null,
		};

		if (isPalmengartenTree(tree.bezirk)) {
			const strategy = tree.objekt ? pgStrategies[tree.objekt] : null;
			if (strategy) {
				return {
					...tree,
					sollwert_30cm: strategy.strategie_30cm_max,
					sollwert_60cm: strategy.strategie_60cm_max,
					sollwert_90cm: strategy.strategie_90cm_max,
				};
			}
		} else {
			const strategy =
				tree.standalter !== null && tree.standalter !== undefined
					? gfaStrategies[tree.standalter]
					: null;
			if (strategy) {
				return {
					...tree,
					sollwert_30cm: strategy.strategie_30cm_max,
					sollwert_60cm: strategy.strategie_60cm_max,
					sollwert_90cm: strategy.strategie_90cm_max,
				};
			}
		}

		return { ...tree, ...defaultValues };
	});
}
