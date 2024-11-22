import type { ReducedProfileInfo } from "$lib/domain/profile";

interface SortingCriteria {
    id: string;
	age: number;
	fameRate: number;
	localisation: number;
	mask:boolean;
}

interface AgeCriteria {
	range: [number, number];
	order: "ascendant" | "descendant" | "none"
}

interface FameCriteria {
	range: [number, number];
	order: "ascendant" | "descendant" | "none"
}

interface LocalisationCriteria {
	order: 'closest' | 'none'
	country: string
}


export interface SortingInfo {
	age: AgeCriteria;
	fameRate: FameCriteria;
	localisation: LocalisationCriteria;
}

function sortByAge(array: SortingCriteria[] | ReducedProfileInfo[], order: "ascendant" | "descendant" | "none") {
	if (order == "ascendant") {
		const compare = (a: SortingCriteria | ReducedProfileInfo, b: SortingCriteria | ReducedProfileInfo) => {
			return a.age - b.age; // Sort by age in ascending order
		};
		array.sort(compare);
	} else if (order == "descendant") {
		const compare = (a: SortingCriteria | ReducedProfileInfo, b: SortingCriteria | ReducedProfileInfo) => {
			return b.age - a.age; // Sort by age in ascending order
		};
		array.sort(compare);
	}
	return (array);
}

function sortByfameRate(array: SortingCriteria[] | ReducedProfileInfo[], order: "ascendant" | "descendant" | "none") {
	if (order == "ascendant") {
		const compare = (a: SortingCriteria | ReducedProfileInfo, b: SortingCriteria | ReducedProfileInfo) => {
			return a.fameRate - b.fameRate; // Sort by age in ascending order
		};
		array.sort(compare);
	} else if (order == "descendant") {
		const compare = (a: SortingCriteria | ReducedProfileInfo, b: SortingCriteria | ReducedProfileInfo) => {
			return b.fameRate - a.fameRate; // Sort by age in ascending order
		};
		array.sort(compare);
	}
	return (array);
}


function sortByLocalization(array: SortingCriteria[] | ReducedProfileInfo[], order: 'closest' | 'none') {
	if (order == "closest") {
		const compare = (a: SortingCriteria | ReducedProfileInfo, b: SortingCriteria | ReducedProfileInfo) => {
			return a.localisation - b.localisation; // Sort by age in ascending order
		};
		array.sort(compare);
	}
	return (array);
}

function filterByAge(array: SortingCriteria[] | ReducedProfileInfo[], range: [number, number]) {
	const apply = (value: SortingCriteria | ReducedProfileInfo, index: number, array: SortingCriteria[] | ReducedProfileInfo[]) => {
		if (!(value.age >= range[0] && value.age <= range[1])) {
			console.log('laaaaaaaaaaaaaaaaaaaaa1', index, range, value.age)
			array[index].mask = false;
		} 
	}
	array.forEach(apply)
	console.log('in filter: ', array)
	return (array);
}

function filterByFameRating(array: SortingCriteria[] | ReducedProfileInfo[], range: [number, number]) {
	const apply = (value: SortingCriteria | ReducedProfileInfo, index: number, array: SortingCriteria[] | ReducedProfileInfo[]) => {
		if (!(value.fameRate >= range[0] && value.fameRate <= range[1])){
			array[index].mask = false;
		}
	}
	array.forEach(apply)
	return (array);
}



export {sortByfameRate, sortByAge, sortByLocalization, filterByAge, filterByFameRating}
export type { SortingCriteria }
