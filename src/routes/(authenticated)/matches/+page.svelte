<script lang="ts">
	import type { PageData } from '../visits/$types';

	export let data: PageData;
</script>

<div class="flex flex-row justify-center">
	<div class="">
		<ul role="list" class="divide-y divide-gray-100">
			<li class="flex items-center justify-between gap-x-6 py-5">
				<div class="flex min-w-0 gap-x-4">
					<img
						class="size-12 flex-none rounded-full bg-gray-50"
						src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
						alt=""
					/>
					<div class="min-w-0 flex-auto">
						<p class="text-sm/6 font-semibold text-gray-900">Leslie Alexander</p>
						<p class="mt-1 truncate text-xs/5 text-gray-500">leslie.alexander@example.com</p>
					</div>
				</div>
				<a
					href="#"
					class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
					>View</a
				>
			</li>
		</ul>
	</div>
</div>
