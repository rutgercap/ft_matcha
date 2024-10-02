<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	export let data;

	const { enhance, form, errors, constraints, message } = superForm(data.form);
</script>

<div class="flex md:pt-12 flex-col justify-center px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<img
			class="mx-auto h-10 w-auto"
			src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
			alt="Matcha"
		/>
		<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
			Sign in to your account
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6" method="POST" use:enhance>
			<div>
				<label for="username" class="block text-sm font-medium leading-6 text-gray-900"
					>Username</label
				>
				<div class="mt-2">
					<input
						bind:value={$form.username}
						id="username"
						name="username"
						required
						aria-invalid={$errors.username ? 'true' : undefined}
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						{...$constraints.username}
					/>
					{#if $errors.username}
						<p class="mt-2 text-sm text-red-600">{$errors.username}</p>
					{/if}
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between">
					<label for="password" class="block text-sm font-medium leading-6 text-gray-900">
						Password
					</label>
					<!-- <div class="text-sm">
						<a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500"
							>Forgot password?</a
						>
					</div> -->
				</div>
				<div class="mt-2">
					<input
						bind:value={$form.password}
						id="password"
						name="password"
						type="password"
						aria-invalid={$errors.password ? 'true' : undefined}
						autocomplete="current-password"
						required
						{...$constraints.password}
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					/>
					{#if $errors.password}
						<p class="mt-2 text-sm text-red-600">{$errors.password}</p>
					{/if}
				</div>
			</div>

			<div>
				<button
					type="submit"
					class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>Sign in
				</button>
			</div>
			{#if $message}
				<p class="mt-2 text-sm text-red-600">{$message}</p>
			{/if}
		</form>
		<p class="mt-10 text-center text-sm text-gray-500">
			Not a member?
			<a href="sign-up" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
				>Sign up instead.</a
			>
		</p>
	</div>
</div>
