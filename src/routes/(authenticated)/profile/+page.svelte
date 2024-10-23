<script lang="ts">
	import type { PageData } from './$types';
	import _ from 'lodash';

	export let data: PageData;

	let { profileInfo } = data;

	let all_url = ['/api/pics/' + profileInfo.pictures_filenames[0] + `?t=${Date.now()}`,
					'/api/pics/' + profileInfo.pictures_filenames[1] + `?t=${Date.now()}`,
					 '/api/pics/' + profileInfo.pictures_filenames[2] + `?t=${Date.now()}`,
					 '/api/pics/' + profileInfo.pictures_filenames[3] + `?t=${Date.now()}`,
					 '/api/pics/' + profileInfo.pictures_filenames[4] + `?t=${Date.now()}`
					]
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
				href="/profile/edit-profile"
				type="button"
				class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
				>Edit</a
			>
		</div>
	</div>
	<br />
	<div class="mt-1 grid gap-4">
		<div>
			<img
				class="h-auto max-w-full rounded-lg"
				src={all_url[0]}
				alt=""
			/>
		</div>
		<div class="grid grid-cols-4 gap-4">
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src={all_url[1]}
					alt=""
				/>
			</div>
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src={all_url[2]}
					alt=""
				/>
			</div>
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src={all_url[3]}
					alt=""
				/>
			</div>
			<div>
				<img
					class="h-auto max-w-full rounded-lg"
					src={all_url[4]}
					alt=""
				/>
			</div>
		</div>
	</div>

	<div class="mt-6 border-t border-gray-100">
		<dl class="divide-y divide-gray-100">
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-lg font-medium leading-6 text-gray-900">About</dt>
				<dd class="mt-1 text-lg leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
					{profileInfo.biography}
				</dd>
			</div>
		</dl>
		<dl class="divide-y divide-gray-100">
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-lg font-medium leading-6 text-gray-900">Interests</dt>
				<dd class="mt-1 text-lg leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
					{#each profileInfo.tags as tag}
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
				<dt class="text-lg font-medium leading-6 text-gray-900">Is a</dt>
				<dd class="mt-1 text-lg leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
					{profileInfo.gender}
				</dd>
			</div>
		</dl>
		<dl class="divide-y divide-gray-100">
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-lg font-medium leading-6 text-gray-900">Is looking for</dt>
				<dd class="mt-1 text-lg leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
					{profileInfo.sexualPreference}
				</dd>
			</div>
		</dl>
	</div>
</div>
