'use server';

import { createClient } from '@/lib/supabase/server';
import { isPalmengartenTree } from '@/lib/utils';

/** Row of `irrigation_targets_by_age`, limited to the columns read here. */
interface IrrigationTargetRow {
	tree_site_age: number;
	target_max_30cm: number | null;
	target_max_60cm: number | null;
	target_max_90cm: number | null;
}

export interface TreeWithTargetValues {
	target_30cm: number | null;
	target_60cm: number | null;
	target_90cm: number | null;
}

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
		target_30cm: null,
		target_60cm: null,
		target_90cm: null,
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
				target_30cm: data.strategie_30cm_max,
				target_60cm: data.strategie_60cm_max,
				target_90cm: data.strategie_90cm_max,
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
			target_30cm: data.strategie_30cm_max,
			target_60cm: data.strategie_60cm_max,
			target_90cm: data.strategie_90cm_max,
		};
	} catch (error) {
		console.error('Error fetching tree target values:', error);
		return defaultValues;
	}
}

/**
 * Batch function to get target values for multiple trees efficiently.
 * Fetches the targets for all distinct `tree_site_age` values in one query.
 * Trees without a site age or without a matching target row get null values.
 */
export async function getMultipleTreeTargetValues<
	T extends { tree_site_age?: number | null },
>(trees: T[]): Promise<(T & TreeWithTargetValues)[]> {
	const supabase = await createClient();

	const siteAges = [
		...new Set(
			trees
				.map((t) => t.tree_site_age)
				.filter((age): age is number => age !== null && age !== undefined),
		),
	];
	let targetsBySiteAge: Record<number, IrrigationTargetRow> = {};

	if (siteAges.length > 0) {
		const { data, error } = await supabase
			.from('irrigation_targets_by_age')
			.select(
				'tree_site_age, target_max_30cm, target_max_60cm, target_max_90cm',
			)
			.in('tree_site_age', siteAges);

		// A failed lookup is not fatal: the trees are still shown, without targets.
		if (error) {
			console.error(`Fehler in getMultipleTreeTargetValues: ${error.message}`);
		} else if (data) {
			targetsBySiteAge = Object.fromEntries(
				data.map((target: IrrigationTargetRow) => [
					target.tree_site_age,
					target,
				]),
			);
		}
	}

	return trees.map((tree) => {
		const target =
			tree.tree_site_age !== null && tree.tree_site_age !== undefined
				? targetsBySiteAge[tree.tree_site_age]
				: undefined;

		return {
			...tree,
			target_30cm: target?.target_max_30cm ?? null,
			target_60cm: target?.target_max_60cm ?? null,
			target_90cm: target?.target_max_90cm ?? null,
		};
	});
}
