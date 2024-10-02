<script lang="ts">
	import { page } from '$app/stores';

	let status = $page.status;

	function statusToText(status: number): string {
		switch (status) {
			case 404:
				return 'Not Found';
			case 500:
				return 'Internal Server Error';
			default:
				return 'Something went wrong.';
		}
	}

	function statusToLongText(status: number): string {
		switch (status) {
			case 404:
				return 'Sorry, we couldn’t find the page you’re looking for.';
			case 500:
				return 'Please try again later.';
			default:
				return 'Please try again later.';
		}
	}
</script>

<div
	class="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8"
>
	<p class="text-base font-semibold leading-8 text-indigo-600">{status}</p>
	<h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
		{statusToText(status)}
	</h1>
	<p class="mt-6 text-base leading-7 text-gray-600">{statusToLongText(status)}</p>
	<div class="mt-10">
		<a href="/profile" class="text-sm font-semibold leading-7 text-indigo-600"
			><span aria-hidden="true">&larr;</span> Back to home</a
		>
	</div>
</div>
