import { error } from '@sveltejs/kit';

export async function GET({ params, locals: { userRepository } }) {
	const user_id = params.user_id;
	const order = Number(params.order);

	if (order < 0 || order > 4) {
		throw error(400, 'Invalid order');
	}
	try {
		const image = await userRepository.userImage(user_id, order);
		if (!image) {
			return new Response('Image not found', { status: 404 });
		}
		const mimeType = 'image/jpeg';
		return new Response(image, {
			headers: {
				'Content-Type': mimeType,
				'Cache-Control': 'max-age=3600'
			}
		});
	} catch (error) {
		return new Response('Error reading image', { status: 500 });
	}
}

export async function DELETE({ locals: { user, userRepository }, params }) {
	const user_id = params.user_id;
	const order = Number(params.order);
	if (order < 0 || order > 4) {
		throw error(400, 'Invalid order');
	}
	if (!user || user_id !== user.id) {
		throw error(403, 'Forbidden');
	}
	try {
		await userRepository.deleteUserImage(user_id, order);
		return new Response(null, { status: 204 });
	} catch {
		throw error(500, 'Error deleting image');
	}
}
