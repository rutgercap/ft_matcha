import { error, redirect } from '@sveltejs/kit';
import type { ReducedProfileInfo } from '$lib/domain/browse';
import type { PageServerLoad } from './$types';
import { faker } from '@faker-js/faker';

export const load: PageServerLoad = async ({
	locals: { user, browsingRepository },
}) => {
	if (!user) {
		throw redirect(401, '/login');
	}

	try {
		const userReducedProfile = await browsingRepository.browsingInfoFor(user.id)
		let ids: string[] = await browsingRepository.allOtherUsers(user.id);
		let profiles: ReducedProfileInfo[] = await Promise.all(ids.map((idObj: string) => browsingRepository.browsingInfoFor(idObj)));
		profiles = await browsingRepository.preFilter(userReducedProfile.sexual_preference, profiles)
		profiles = await browsingRepository.fameRateAll(profiles)
		profiles = await browsingRepository.scoreThemAll(user.id, profiles)
		profiles = await browsingRepository.sort(profiles)

		let idx = 0
		for (const pr of profiles) {
			pr.localisation = faker.number.int({ min: 0, max: 1000 })
			pr.mask = true;
			idx++
		}
		return { profiles };
	} catch (error) {
		console.error('Error loading browsing page:', error); // Log the error for debugging

		// Return a fallback response for the UI or notify the user about the issue
		return {
			error: true,
			message: 'An error occurred while loading the browsing page. Please try again later.',
			profiles: [], // Return an empty array to ensure the page still renders
		};
	}


};
