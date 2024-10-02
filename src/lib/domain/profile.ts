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
};

export { Gender, SexualPreference, isSexualPreference, isGender };
export type { ProfileInfo };
