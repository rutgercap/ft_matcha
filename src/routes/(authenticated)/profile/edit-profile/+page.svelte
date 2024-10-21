<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { page } from '$app/stores';

	export let data: PageData;

	const { enhance, form, errors, constraints, message, tainted, isTainted } = superForm(data.form, {
		resetForm: true
	});
	let imageUrl = '/api/pics/' + $form.pictures_filenames + `?t=${Date.now()}`

	// Trigger file input click when the image is clicked
	function triggerFileInput() {
		document.getElementById('pictures').click(); // Simulate click on the hidden input
	}

	let avatar;
	const handleFileInput = (e) => {
    	$form.image = e.currentTarget.files?.item(0) as File; // No need for 'as File' here
		let reader = new FileReader();  // To read the file as a DataURL
		reader.readAsDataURL($form.image);  // Convert the file to DataURL
		reader.onload = (e) => {
			imageUrl = e.target.result;  
			console.log(imageUrl);  // For debugging, logs the DataURL (image in base64 format)
		};
  	};

</script>

<div class="max-w-3xl mx-auto">
	<form class="px-4 mb-8" method="POST" use:enhance enctype="multipart/form-data">
		<div class="space-y-10">
			<h2 class="text-base font-semibold leading-7 text-gray-900">Profile Information</h2>
			<div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
				<div class="sm:col-span-3">
					<label for="firstName" class="block text-sm font-medium leading-6 text-gray-900"
						>First name</label
					>
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
					{#if $errors.firstName}
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
					{#if $errors.lastName}
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
					{#if $errors.gender}
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
					{#if $errors.sexualPreference}
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
					{#if $errors.biography}
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
				<div class="col-span-full">
					<label for="pictures" class="block text-sm font-medium leading-6 text-gray-900">Profile pictures</label>
					<input
						id="pictures"
						name="pictures"
						type="file"
						on:input={handleFileInput}
						accept="image/png, image/jpeg, image/jpg"
						class="hidden"
					/>

					<!-- Display the image and make it clickable -->

					<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions (because of reasons) -->
					<div class="profile-picture-upload" on:click={triggerFileInput}>
						<img
						src={imageUrl}
						alt="profile"
						class="profile-picture-preview"
						style="cursor: pointer; max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 50%;"
						/>
					</div>

					{#if errors.profileImage}
						<span class="error">{errors.profileImage}</span>
					{/if}
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
