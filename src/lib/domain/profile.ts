enum Gender {
	MAN = 'man',
	WOMAN = 'woman',
	OTHER = 'other'
}

function isGender(value: string): value is Gender {
	return Object.values(Gender).includes(value as Gender);
}

function isSexualPreference(value: string): value is SexualPreference {
	return Object.values(SexualPreference).includes(value as SexualPreference);
}

enum SexualPreference {
	MEN = 'men',
	WOMEN = 'women',
	ALL = 'all',
	OTHER = 'other'
}

type ProfileInfo = {
	firstName: string;
	lastName: string;
	gender: Gender;
	sexualPreference: SexualPreference;
	biography: string;
	tags: string[];
	pictures: File[] | null[];
	pictures_filenames: string[];
};

type ReducedProfileInfo = {
	userName: string;
	biography: string;
	gender: string;
	picture: string;
	age: number;
    fameRate: number;
    localisation: number;
	mask: boolean;
}

function initials(profileInfo: ProfileInfo): string {
	return (profileInfo.firstName[0] + profileInfo.lastName[0]).toUpperCase();
}

export { Gender, SexualPreference, isSexualPreference, isGender, initials };
export type { ProfileInfo, ReducedProfileInfo };
