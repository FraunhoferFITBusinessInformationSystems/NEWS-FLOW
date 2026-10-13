'use server';

import { createClient } from '@/lib/supabase/server';

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
 * Get the target values for one tree from `irrigation_targets_by_age` via its
 * `tree_site_age`. Trees without a site age or without a matching target row
 * get null values.
 */
export async function getTreeTargetValues(tree: {
	tree_site_age?: number | null;
}): Promise<TreeWithTargetValues> {
	const defaultValues: TreeWithTargetValues = {
		target_30cm: null,
		target_60cm: null,
		target_90cm: null,
	};

	if (tree.tree_site_age === null || tree.tree_site_age === undefined) {
		return defaultValues;
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from('irrigation_targets_by_age')
		.select('target_max_30cm, target_max_60cm, target_max_90cm')
		.eq('tree_site_age', tree.tree_site_age)
		.maybeSingle();

	// A failed lookup is not fatal: the tree is still shown, without targets.
	if (error) {
		console.error(`Fehler in getTreeTargetValues: ${error.message}`);
		return defaultValues;
	}
	if (!data) {
		return defaultValues;
	}

	return {
		target_30cm: data.target_max_30cm,
		target_60cm: data.target_max_60cm,
		target_90cm: data.target_max_90cm,
	};
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
