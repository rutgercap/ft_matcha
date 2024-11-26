<script lang="ts">
	import type { ReducedProfileInfo } from '$lib/domain/profile.js';

	export let data;

	let users: ReducedProfileInfo[] = data.profiles;
	let ids: string[] = data.ids;
</script>

<div class="bg-white">
	<div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
		<h2 class="text-2xl font-bold tracking-tight text-gray-900">Find your babe here</h2>
		<ul class="mt-6 space-y-6">
			{#if ids.length > 0}
				{#each ids as id, index}
					<a href={`/profile/${id}`}>
						<li
							class="group flex items-center space-x-4 p-6 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-300"
						>
							<img
								src={`/api/pics/${id}/0`}
								alt={id}
								class="h-24 w-24 rounded-full bg-gray-200 object-cover"
							/>
							<div class="flex-1">
								<h3 class="text-lg font-medium text-gray-900">
									<a href={`/profile/${id}`} class="hover:underline">
										{users[index].username}
									</a>
								</h3>
								<p class="text-sm text-gray-500">{users[index].biography}</p>
							</div>
							<p
								class="text-xl font-bold"
								style="color: {users[index].gender === 'man' ? '#0042ad' : '#ff0099'};"
							>
								{users[index].gender}
							</p>
						</li>
					</a>
				{/each}
			{:else}
				<p class="text-gray-500">No profiles found. Please try again later.</p>
			{/if}
		</ul>
	</div>
</div>
