<script lang="ts">
	export let data;
	import { sortByAge, sortByfameRate, sortByLocalization, applyfilter } from './sorting';
	import type { SortingCriteria, SortingInfo } from './sorting';
	import SortAndFilter from '$lib/component/SortAndFilter.svelte';
	import type { ReducedProfileInfo } from '$lib/domain/profile';

	let users: ReducedProfileInfo[] = data.profiles;
	let ids: any[] = data.ids;

	// I make a copy of the array to keep a reset option
	let filteredUsers: ReducedProfileInfo[] | SortingCriteria[] = structuredClone(users);

	let isFilterPopupOpen = false; // Controls visibility of the popup

	// Default sorting criteria
	let sortingCriteria: SortingInfo = {
		age: { order: 'none', range: [18, 99] },
		localisation: { order: 'none', country: '' },
		fameRate: { order: 'none', range: [0, 1] }
	};

	// Apply the sorting and filtering logic
	function applyFilters(event: CustomEvent) {
		sortingCriteria = event.detail.sortingCriteria;

		console.log('in the apply filter function:', sortingCriteria);
		if (sortingCriteria.age.order) {
			filteredUsers = sortByAge(filteredUsers, sortingCriteria.age.order);
		}

		if (sortingCriteria.fameRate.order) {
			filteredUsers = sortByfameRate(filteredUsers, sortingCriteria.fameRate.order);
		}

		if (sortingCriteria.localisation.order) {
			filteredUsers = sortByLocalization(filteredUsers, sortingCriteria.localisation.order);
		}

		filteredUsers = applyfilter(
			filteredUsers,
			sortingCriteria.age.range,
			sortingCriteria.fameRate.range
		);
		isFilterPopupOpen = false;
	}

	function resetList(event: CustomEvent) {
		sortingCriteria = event.detail.sortingCriteria;
		filteredUsers = structuredClone(users);
		isFilterPopupOpen = false;
	}
</script>

<div class="bg-white">
	<div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
		<div class="flex justify-between items-center">
			<h2 class="text-2xl font-bold tracking-tight text-gray-900">Find your cyber babe here</h2>
			<button
				on:click={() => (isFilterPopupOpen = true)}
				class="text-sm font-semibold text-blue-600 hover:underline focus:outline-none"
			>
				Sort & Filter
			</button>
		</div>

		<!-- Filter/Sort Popup -->
		{#if isFilterPopupOpen}
			<SortAndFilter
				bind:closeComponent={isFilterPopupOpen}
				on:applyFilters={applyFilters}
				on:resetList={resetList}
				{sortingCriteria}
			/>
		{/if}

		<ul class="mt-6 space-y-6">
			{#if ids.length > 0}
				{#each ids as id, index}
					{#if filteredUsers[index].mask}
						<li
							class="group flex items-center space-x-4 p-6 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-300"
						>
							<!-- User's Profile Picture -->
							<img
								src={`/api/pics/${filteredUsers[index]}/0`}
								alt={id.id}
								class="h-24 w-24 rounded-full bg-gray-200 object-cover"
							/>

							<!-- User Details -->
							<div class="flex-1">
								<!-- Username and Gender -->
								<h3 class="text-lg font-medium text-gray-900">
									<a href={`/profile/${id.id}`} class="hover:underline">
										{filteredUsers[index].username}
									</a>
								</h3>
								<p
									class="text-l font-bold"
									style="color: {filteredUsers[index].gender === 'man' ? '#0042ad' : '#ff0099'};"
								>
									{filteredUsers[index].gender}
								</p>

								<!-- Additional Details -->
								<div class="mt-2">
									<p class="text-sm text-gray-700">
										<span class="font-semibold">Age:</span>
										{filteredUsers[index].age} years
									</p>
									<p class="text-sm text-gray-700">
										<span class="font-semibold">Fame Rate:</span>
										{(filteredUsers[index].fameRate * 100).toFixed(1)}%
									</p>
									<p class="text-sm text-gray-700">
										<span class="font-semibold">Localisation:</span>
										{filteredUsers[index].localisation} km
									</p>
								</div>
							</div>
							<!-- User Biography -->
							<p class="text-sm text-gray-500">{filteredUsers[index].biography}</p>
						</li>
					{/if}
				{/each}
			{:else}
				<p class="text-gray-500">No profiles found. Please try again later.</p>
			{/if}
		</ul>
	</div>
</div>
