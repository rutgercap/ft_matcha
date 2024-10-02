<script lang="ts">
	import type { PageData } from './$types';
	import _ from 'lodash';

	export let data: PageData;

	let { profileInfo } = data;
	const tags = ['Cooking', 'Gaming', 'Killing-people'];
</script>

<div class="max-w-3xl md:mx-auto mx-4 mb-10">
	<div class="md:flex md:items-center md:justify-between">
		<div class="min-w-0 flex-1">
			<h2
				class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
			>
				{`${_.capitalize(profileInfo.firstName)} ${_.capitalize(profileInfo.lastName)}`}
			</h2>
		</div>
		<div class="mt-4 flex md:ml-4 md:mt-0">
			<a
				href="/profile/edit-personal-info"
				type="button"
				class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
				>Edit</a
			>
		</div>
	</div>

	<div class="mt-14 grid gap-4">
		<div>
			<img
				class="h-auto max-w-full rounded-lg"
				src="https://flowbite.s3.amazonaws.com/docs/gallery/featured/image.jpg"
				alt=""
			/>
		</div>
		<div class="grid grid-cols-5 gap-4">
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg"
					alt=""
				/>
			</div>
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg"
					alt=""
				/>
			</div>
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg"
					alt=""
				/>
			</div>
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg"
					alt=""
				/>
			</div>
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg"
					alt=""
				/>
			</div>
		</div>
	</div>

	<div class="mt-6 border-t border-gray-100">
		<dl class="divide-y divide-gray-100">
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-sm font-medium leading-6 text-gray-900">About</dt>
				<dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
					{profileInfo.biography}
				</dd>
			</div>
		</dl>
		<dl class="divide-y divide-gray-100">
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-sm font-medium leading-6 text-gray-900">Interests</dt>
				<dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
					{#each tags as tag}
						<span
							class="mx-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
							>#{tag}</span
						>
					{/each}
				</dd>
			</div>
		</dl>
		<dl class="divide-y divide-gray-100">
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-sm font-medium leading-6 text-gray-900">Is a</dt>
				<dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
					{profileInfo.gender}
				</dd>
			</div>
		</dl>
		<dl class="divide-y divide-gray-100">
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-sm font-medium leading-6 text-gray-900">Is looking for</dt>
				<dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
					{profileInfo.sexualPreference}
				</dd>
			</div>
		</dl>
	</div>
</div>
