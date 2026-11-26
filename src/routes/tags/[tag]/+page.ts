import { error } from '@sveltejs/kit';
import { skillsWithTag, tagCounts } from '$lib/catalog';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => tagCounts().map(({ tag }) => ({ tag }));

export const load: PageLoad = ({ params }) => {
	const skills = skillsWithTag(params.tag);
	if (skills.length === 0) error(404, 'Not found');
	return { tag: params.tag, skills };
};
