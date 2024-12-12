<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: matchPreviews = data.matchPreviews;
	$: likedProfilePreviews = data.likedProfilePreviews;
	$: likedByProfilePreviews = data.likedByProfilePreviews;
</script>

<div class="flex flex-row justify-center">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 mb-4">Matches</h1>
		{#if matchPreviews.length === 0}
			<p class="text-sm text-gray-500">No matches yet. Loser!</p>
		{:else}
			<ul role="list" class="divide-y divide-gray-100">
				{#each matchPreviews as match}
					<li class="flex items-center border px-4 rounded-xl justify-between gap-x-6 py-5">
						<div class="flex min-w-0 gap-x-4">
							<img
								class="size-12 flex-none rounded-full bg-gray-50"
								src={`/api/pics/${match.userId}/0`}
								alt="profile"
							/>
							<div class="min-w-0 flex-auto">
								<a
									href={`/profile/${match.userId}`}
									class="text-sm/6 hover:underline font-semibold text-gray-900"
									>{match.firstName} {match.lastName}</a
								>
							</div>
						</div>
						<a
							href={`/chat/${match.userId}`}
							class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
							>Chat</a
						>
					</li>
				{/each}
			</ul>
		{/if}
		<h1 class="text-2xl mt-6 font-bold text-gray-900 mb-4">You are liked by</h1>
		{#if likedByProfilePreviews.length === 0}
			<p class="text-sm text-gray-500">Nobody likes you! Loser.</p>
		{:else}
			<ul role="list" class="divide-y divide-gray-100">
				{#each likedByProfilePreviews as profile}
					<li class="flex items-center border px-4 rounded-xl justify-between gap-x-6 py-5">
						<div class="flex min-w-0 gap-x-4">
							<img
								class="size-12 flex-none rounded-full bg-gray-50"
								src={`/api/pics/${profile.userId}/0`}
								alt="profile"
							/>
							<div class="min-w-0 flex-auto">
								<a
									href={`/profile/${profile.userId}`}
									class="text-sm/6 hover:underline font-semibold text-gray-900"
									>{profile.firstName} {profile.lastName}</a
								>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
		<h1 class="text-2xl mt-6 font-bold text-gray-900 mb-4">Profiles you liked</h1>
		{#if likedProfilePreviews.length === 0}
			<p class="text-sm text-gray-500">You didn't like anyone yet.</p>
		{:else}
			<ul role="list" class="divide-y divide-gray-100">
				{#each likedProfilePreviews as profile}
					<li class="flex items-center border px-4 rounded-xl justify-between gap-x-6 py-5">
						<div class="flex min-w-0 gap-x-4">
							<img
								class="size-12 flex-none rounded-full bg-gray-50"
								src={`/api/pics/${profile.userId}/0`}
								alt="profile"
							/>
							<div class="min-w-0 flex-auto">
								<a
									href={`/profile/${profile.userId}`}
									class="text-sm/6 hover:underline font-semibold text-gray-900"
									>{profile.firstName} {profile.lastName}</a
								>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
