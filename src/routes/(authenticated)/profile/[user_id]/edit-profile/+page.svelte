<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { Icon, Trash } from 'svelte-hero-icons';
	import addToast from '$lib/toast/toastStore';
	import { MAX_PICTURES } from '$lib/imageRepository';

	export let data: PageData;
	$: user = data.user;

	const { enhance, form, errors, constraints, message, tainted, isTainted } = superForm(data.form, {
		resetForm: false
	});

	const maxPictures = MAX_PICTURES;

	const refreshKeys = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];

	async function uploadPicture(
		idx: number,
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const inputElement = event.target;
		if (!(inputElement instanceof HTMLInputElement) || inputElement.files === null) {
			console.error('Invalid input element.');
			return;
		}
		const file = inputElement.files[0];
		const formData = new FormData();
		formData.append('image', file, file.name);
		try {
			const response = await fetch(`/api/pics/${user.id}/${idx}`, {
				method: 'POST',
				body: formData
			});
			if (response.ok) {
				refreshKeys[idx] = Math.random();
			} else {
				addToast({ message: 'Something went wrong uploading picture', type: 'error' });
				console.error('Failed to upload file:', response.statusText);
			}
		} catch (error) {
			addToast({ message: 'Something went wrong uploading picture', type: 'error' });
			console.error('Error uploading file:', error);
		}
	}

	async function handleDeletePicture(index: number) {
		const urlToDelete = `/api/pics/${user.id}/${index}`;

		try {
			const result = await fetch(urlToDelete, {
				method: 'DELETE'
			});
			if (result.ok) {
				refreshKeys[index] = Math.random();
			} else {
				addToast({ message: 'Something went wrong deleting picture', type: 'error' });
				console.error('Failed to delete picture:', result.statusText);
			}
		} catch (e) {
			addToast({ message: 'Something went wrong deleting picture', type: 'error' });
			console.error('Error deleting picture:', e);
		}
	}
</script>

<div class="max-w-3xl mx-auto">
	<div class="space-y-10">
		<div class="flex items-center justify-between">
			<h2 class="text-base font-semibold leading-7 text-gray-900">Edit profile</h2>
			<a
				href="/profile/{user.id}/edit-profile/change-email"
				class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				Edit private info
			</a>
		</div>
		<div class="col-span-full profile-picture-row">
			{#each Array(maxPictures) as _, i}
				<div class="profile-picture-container">
					<input
						id={`pictures-${i}`}
						name="pictures"
						type="file"
						on:input={(e) => uploadPicture(i, e)}
						accept="image/png, image/jpeg, image/jpg"
						class="hidden"
					/>
					<div class="profile-picture-upload">
						<img
							alt="profile"
							class="profile-picture-preview"
							src={`/api/pics/${user.id}/${i}?refreshKey=${refreshKeys[i]}`}
						/>
					</div>
					<button class="delete-icon" on:click={() => handleDeletePicture(i)}>
						<Icon src={Trash} class="h-8 w-auto" />
					</button>
				</div>
			{/each}
		</div>
	</div>
	<form class="px-4 mb-8 mt-10" method="POST" use:enhance enctype="multipart/form-data">
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
						<p class="mt-2 text-sm text-red-600" id="tags-error">{$errors.tags}</p>
					{/if}
				</div>
				{#if $message}
					{#if $page.status == 200}
						<p class="mt-2 text-sm text-green-600">{$message}</p>
					{:else}
						<p class="mt-2 text-sm text-red-600">{$message}</p>
					{/if}
				{/if}
				<div class="mt-6 flex items-center w-full h-full justify-end gap-x-6">
					<a
						href={`/profile/${user?.id}`}
						type="button"
						class="text-sm font-semibold leading-6 text-gray-900">Cancel</a
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
			</div>
		</div>
	</form>
</div>

<style>
	.profile-picture-row {
		overflow-x: auto;
		display: flex;
		gap: 10px;
		justify-content: flex-start;
	}

	.profile-picture-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 140px;
		overflow: hidden;
	}

	.profile-picture-upload {
		display: inline-block;
		cursor: pointer;
		width: 135px;
		height: 135px;
		position: relative;
	}

	.profile-picture-preview {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 10px;
		border: 1px solid #ddd;
	}

	.delete-icon {
		margin-top: 5px;
		cursor: pointer;
	}

	.delete-button {
		width: 24px;
		height: 24px;
	}
</style>
