<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	let chats: ChatPreview[] = data.chatPreviews;
</script>

<div class="flex flex-row justify-center">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 mb-4">Chats</h1>
		{#if chats.length === 0}
			<p class="text-sm text-gray-500">No chats yet. Loser!</p>
		{:else}
			<ul role="list" class="divide-y divide-gray-100">
				{#each chats as chat}
					<li class="flex items-center border px-4 rounded-xl justify-between gap-x-6 py-5">
						<div class="flex min-w-0 gap-x-4">
							<!-- <img
								class="size-12 flex-none rounded-full bg-gray-50"
								src={`/api/pics/${match.userId}/0`}
								alt="profile"
							/> -->
							<div class="min-w-0 flex-auto">
								<!-- <a
									href={`/profile/${match.userId}`}
									class="text-sm/6 hover:underline font-semibold text-gray-900"
									>{match.firstName} {match.lastName}</a
								> -->
							</div>
						</div>
						<a
							href="#"
							class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
							>Chat</a
						>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
