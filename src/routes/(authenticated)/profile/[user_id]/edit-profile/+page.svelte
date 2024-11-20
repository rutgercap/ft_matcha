<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	const { enhance, form, errors, constraints, message, tainted, isTainted } = superForm(data.form, {
		resetForm: false
	});

	let all_url = [
		'/api/pics/' + $form.pictures_filenames[0] + `?t=${Date.now()}`,
		'/api/pics/' + $form.pictures_filenames[1] + `?t=${Date.now()}`,
		'/api/pics/' + $form.pictures_filenames[2] + `?t=${Date.now()}`,
		'/api/pics/' + $form.pictures_filenames[3] + `?t=${Date.now()}`,
		'/api/pics/' + $form.pictures_filenames[4] + `?t=${Date.now()}`
	];

	function triggerEachFileInput(idx) {
		document.getElementById(`pictures-${idx}`).click(); 
	}

	const handleEachFileInput = (idx, e) => {
		if (!$form.pictures) {
			$form.pictures = [];
		}
		$form.pictures[idx] = e.currentTarget.files?.item(0);
		let reader = new FileReader(); 
		reader.readAsDataURL($form.pictures[idx]); 
		reader.onload = (e) => {
			all_url[idx] = e.target.result;
		};
	};

	const handleDeletePicture = (index) => {
		// Check if the index is valid
		if (index < 0 || index >= all_url.length) {
			console.error('Invalid index');
			return;
		}

		let urlToDelete = all_url[index];

		if (urlToDelete.startsWith('data:image/')) {
			urlToDelete = all_url[index] =
				'/api/pics/' + $form.pictures_filenames[index] + `?t=${Date.now()}`;
		}
		fetch(urlToDelete, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			if (response.status === 204 || response.headers.get('Content-Length') === '0') {
				$form.pictures_filenames[index] = 'default2';
				all_url[index] = '/api/pics/' + $form.pictures_filenames[index] + `?t=${Date.now()}`;
			}
		});
	};
</script>

<div class="max-w-3xl mx-auto">
	<form class="px-4 mb-8" method="POST" use:enhance enctype="multipart/form-data">
		<div class="space-y-10">
			<h2 class="text-base font-semibold leading-7 text-gray-900">Profile Information</h2>
			<div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
				<div class="sm:col-span-3">
					<label for="firstName" class="block text-sm font-medium leading-6 text-gray-900">
						First name
					</label>
					<div class="mt-2">
						<input
							type="text"
							name="firstName"
							id="firstName"
							autocomplete="given-name"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							bind:value={$form.firstName}
							aria-invalid={$errors.firstName ? 'true' : undefined}
							{...$constraints.firstName}
						/>
					</div>
					{#if $errors.firstName && $tainted}
						<p class="mt-2 text-sm text-red-600" id="email-error">{$errors.firstName}</p>
					{/if}
				</div>

				<div class="sm:col-span-3">
					<label for="lastName" class="block text-sm font-medium leading-6 text-gray-900"
						>Last name</label
					>
					<div class="mt-2">
						<input
							type="text"
							name="lastName"
							id="lastName"
							autocomplete="family-name"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							bind:value={$form.lastName}
							aria-invalid={$errors.lastName ? 'true' : undefined}
							{...$constraints.lastName}
						/>
					</div>
					{#if $errors.lastName && $tainted}
						<p class="mt-2 text-sm text-red-600" id="email-error">{$errors.lastName}</p>
					{/if}
				</div>

				<div class="sm:col-span-3">
					<label for="gender" class="block text-sm font-medium leading-6 text-gray-900"
						>Gender</label
					>
					<div class="mt-2">
						<select
							id="gender"
							name="gender"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
							bind:value={$form.gender}
							aria-invalid={$errors.lastName ? 'true' : undefined}
							{...$constraints.lastName}
						>
							<option value="man">Man</option>
							<option value="woman">Woman</option>
							<option value="other">Other</option>
						</select>
					</div>
					{#if $errors.gender && $tainted}
						<p class="mt-2 text-sm text-red-600" id="email-error">{$errors.gender}</p>
					{/if}
				</div>
				<div class="sm:col-span-3">
					<label for="sexualPreference" class="block text-sm font-medium leading-6 text-gray-900"
						>Sexual preference</label
					>
					<div class="mt-2">
						<select
							id="sexualPreference"
							name="sexualPreference"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
							bind:value={$form.sexualPreference}
							aria-invalid={$errors.sexualPreference ? 'true' : undefined}
							{...$constraints.sexualPreference}
						>
							<option value="men">Men</option>
							<option value="women">Women</option>
							<option value="other">Other</option>
							<option value="all">All</option>
						</select>
					</div>
					{#if $errors.sexualPreference && $tainted}
						<p class="mt-2 text-sm text-red-600" id="email-error">{$errors.sexualPreference}</p>
					{/if}
				</div>
				<div class="col-span-full">
					<label for="biography" class="block text-sm font-medium leading-6 text-gray-900"
						>Biography</label
					>
					<div class="mt-2">
						<textarea
							id="biography"
							name="biography"
							rows="3"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							bind:value={$form.biography}
							aria-invalid={$errors.biography ? 'true' : undefined}
							{...$constraints.biography}
						></textarea>
					</div>
					<p class="mt-3 text-sm leading-6 text-gray-600">Write a few sentences about yourself.</p>
					{#if $errors.biography && $tainted}
						<p class="mt-2 text-sm text-red-600" id="email-error">{$errors.biography}</p>
					{/if}
				</div>
				<div class="col-span-full">
					<label for="tags" class="block text-sm font-medium leading-6 text-gray-900">Tags</label>
					<div class="mt-2">
						<textarea
							id="tags"
							name="tags"
							rows="1"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							bind:value={$form.tags}
							aria-invalid={$errors.tags ? 'true' : undefined}
							aria-describedby={$errors.tags ? 'tags-error' : undefined}
							{...$constraints.tags}
						></textarea>
					</div>
					<p class="mt-3 text-sm leading-6 text-gray-600">Tags are comma separated.</p>
					{#if $errors.tags}
						<p class="mt-2 text-sm text-red-600" id="tags-error">{$errors.tags._errors}</p>
					{/if}
				</div>

				<!-- Image upload field-->
				<label for="pictures" class="block text-sm font-medium leading-6 text-gray-900"
					>Profile pictures</label
				>

				<div class="col-span-full profile-picture-row">
					{#each all_url as img_url, index}
						<div class="profile-picture-container">
							<input
								id={`pictures-${index}`}
								name="pictures"
								type="file"
								on:input={(e) => handleEachFileInput(index, e)}
								accept="image/png, image/jpeg, image/jpg"
								class="hidden"
							/>

							<!-- Display the image and make it clickable -->
							<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions (because of reasons) -->
							<div class="profile-picture-upload" on:click={() => triggerEachFileInput(index)}>
								<img src={img_url} alt="profile" class="profile-picture-preview" />
							</div>
							<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions (because of reasons) -->
							<div class="delete-icon" on:click={() => handleDeletePicture(index)}>
								<img
									src="https://png.pngtree.com/png-vector/20190531/ourmid/pngtree-trash-bin-icon-png-image_1252303.jpg"
									alt="Delete"
									class="delete-button"
								/>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
		{#if $message}
			{#if $page.status == 200}
				<p class="mt-2 text-sm text-green-600">{$message}</p>
			{:else}
				<p class="mt-2 text-sm text-red-600">{$message}</p>
			{/if}
		{/if}
		<div class="mt-6 flex items-center justify-end gap-x-6">
			<a href="/profile" type="button" class="text-sm font-semibold leading-6 text-gray-900"
				>Cancel</a
			>
			<button
				type="submit"
				disabled={!isTainted($tainted)}
				class="rounded-md {isTainted($tainted)
					? 'bg-indigo-600 hover:bg-indigo-500 text-white'
					: 'text-gray-400'} px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				Save
			</button>
		</div>
	</form>
</div>

<style>
	/* Flexbox to align images in a row */
	.profile-picture-row {
		display: flex;
		gap: 10px; /* Space between images */
		justify-content: flex-start;
	}

	.profile-picture-container {
		display: flex;
		flex-direction: column; /* Stack image and delete icon vertically */
		align-items: center;
		width: 140px; /* Set fixed width for each image container */
	}

	.profile-picture-upload {
		display: inline-block;
		cursor: pointer;
		width: 135px; /* Set fixed width for the preview box */
		height: 135px; /* Set fixed height for the preview box */
		position: relative;
	}

	/* Ensure all images are the same size and aspect ratio */
	.profile-picture-preview {
		width: 100%;
		height: 100%;
		object-fit: cover; /* Make sure the image covers the area uniformly */
		border-radius: 10px; /* Add some rounding for a smooth look */
		border: 1px solid #ddd; /* Optional border to highlight images */
	}

	/* Delete icon */
	.delete-icon {
		margin-top: 5px; /* Space between image and delete button */
		cursor: pointer;
	}

	.delete-button {
		width: 24px;
		height: 24px;
	}
</style>
