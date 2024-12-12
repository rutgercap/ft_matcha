<script lang="ts">
	import type { PageData } from './$types';
	import { chatClientStore } from '$lib/stores/chatClientStore';
	import type { Message } from '$lib/domain/chat';

	export let data: PageData;
	const chatId = data.chat.id;
	$: chatClient = $chatClientStore;
	let messages: Message[] = [];
	$: {
		chatClient?.chats.subscribe((chats) => {
			const chat = chats.get(chatId);
			if (chat) {
				messages = chat.messages;
			} else {
				messages = [];
			}
		});
	}

	function sendMessage(event: Event) {
		const input = event.target as HTMLInputElement;
		chatClient?.sendMessage(chatId, input.value);
		input.value = '';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			sendMessage(event);
		}
	}
</script>

<div class="flex flex-row justify-center my-4">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 mb-4">Chats</h1>
		{#if messages.length === 0}
			<p class="text-sm text-gray-500">No messages yet. Loser!</p>
		{:else}
			<ul role="list" class="divide-y divide-gray-100">
				{#each messages as message}
					<li class="flex items-center border px-4 rounded-xl justify-between gap-x-6 py-5">
						<div class="flex min-w-0 gap-x-4">
							<p>{message.message}</p>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
		<input
			on:submit|preventDefault={sendMessage}
			on:keydown={handleKeyDown}
			type="text"
			placeholder="Type your message here"
			class="border border-gray-300 rounded-lg p-2 w-full mt-4"
		/>
	</div>
</div>
