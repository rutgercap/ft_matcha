import { error, redirect } from '@sveltejs/kit';
import { faker } from '@faker-js/faker';

export async function POST({ params, locals: { user, userRepository }, request }) {
	const user_id = params.user_id;
	const longitude = Number(params.longitude);
	const latitude = Number(params.latitude);
	if (!user || user_id !== user.id) {
		throw error(403, 'Forbidden');
	}
	try {
		if (isNaN(longitude) && isNaN(latitude)) {
			// get the request IP
			// the user didnt shared his location use MaxMind to map ip to location
			console.log('USER DIDNT ACCEPTED LOCATION SO CREATING MOCK ONES')
			userRepository.upsertLocation(user_id, faker.address.latitude(), faker.address.longitude())
		} else {
			console.log('coordinate for user' + user.id, ':', longitude, latitude)
			userRepository.upsertLocation(user_id, longitude, latitude)
		}
		return new Response('coordinate uploaded successfully', { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response('Error processing coordinate for user:' + user.id, { status: 500 });
	}
}
