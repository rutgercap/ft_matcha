<script lang="ts">
	import { enhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';

	export let data;

	const { form, errors, constraints, message } = superForm(data.form);
</script>

<form class="px-4 mb-8" method="POST" use:enhance>
	<div class="space-y-10">
		<h2 class="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>
		<div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
			<div class="sm:col-span-3">
				<label for="first-name" class="block text-sm font-medium leading-6 text-gray-900"
					>First name</label
				>
				<div class="mt-2">
					<input
						type="text"
						name="first-name"
						id="first-name"
						autocomplete="given-name"
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						bind:value={$form.firstName}
						aria-invalid={$errors.firstName ? 'true' : undefined}
						{...$constraints.firstName}
					/>
				</div>
			</div>

			<div class="sm:col-span-3">
				<label for="last-name" class="block text-sm font-medium leading-6 text-gray-900"
					>Last name</label
				>
				<div class="mt-2">
					<input
						type="text"
						name="last-name"
						id="last-name"
						autocomplete="family-name"
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						bind:value={$form.lastName}
						aria-invalid={$errors.lastName ? 'true' : undefined}
						{...$constraints.lastName}
					/>
				</div>
			</div>

			<div class="sm:col-span-4">
				<label for="email" class="block text-sm font-medium leading-6 text-gray-900"
					>Email address</label
				>
				<div class="mt-2">
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						bind:value={$form.email}
						aria-invalid={$errors.email ? 'true' : undefined}
						{...$constraints.email}
					/>
				</div>
			</div>

			<div class="sm:col-span-3">
				<label for="country" class="block text-sm font-medium leading-6 text-gray-900">Gender</label
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
			</div>
			<div class="sm:col-span-3">
				<label for="country" class="block text-sm font-medium leading-6 text-gray-900"
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
			</div>
			<div class="col-span-full">
				<label for="about" class="block text-sm font-medium leading-6 text-gray-900"
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
			</div>
		</div>
	</div>
	{#if $message}
		<p class="mt-2 text-sm text-red-600">{$message}</p>
	{/if}
	<div class="mt-6 flex items-center justify-end gap-x-6">
		<a href="/profile" type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</a
		>
		<button
			type="submit"
			class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
		>
			Save
		</button>
	</div>
</form>
