import { error } from '@sveltejs/kit';
import { catalog, findSkill } from '$lib/catalog';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => catalog.skills.map((skill) => ({ name: skill.name }));

export const load: PageLoad = ({ params }) => {
	const skill = findSkill(params.name);
	if (!skill) error(404, 'Not found');
	return { skill };
};
