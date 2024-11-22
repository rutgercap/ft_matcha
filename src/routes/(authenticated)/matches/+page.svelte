<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: matches = data.matches;
	$: profilePreviews = data.profilePreviews
</script>

<div class="flex flex-row justify-center">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 mb-4">Matches</h1>
		<ul role="list" class="divide-y divide-gray-100">
			{#each matches as match, i}
				<li class="flex items-center border px-4 rounded-xl justify-between gap-x-6 py-5">
					<div class="flex min-w-0 gap-x-4">
						<img
							class="size-12 flex-none rounded-full bg-gray-50"
							src={`/api/pics/${match.userTwo}/0`}
							alt="profile"
						/>
						{#await profilePreviews}
						<div class="min-w-0 flex-auto">
							<a href={`/profile/${match.userTwo}`} class="text-sm/6 font-semibold text-gray-900">Loading..</a>
						</div>
						{:then profilePreviews} 
						<div class="min-w-0 flex-auto">
							<a href={`/profile/${match.userTwo}`} class="text-sm/6 hover:underline font-semibold text-gray-900">{profilePreviews[i].firstName} {profilePreviews[i].lastName}</a>
						</div>
						{/await}
					</div>
					<a
						href="#"
						class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
						>Chat</a
					>
				</li>
			{/each}
		</ul>
	</div>
</div>
