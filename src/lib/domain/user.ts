enum Gender {
	MAN="man",
	WOMAN="woman",
	OTHER="other"
}

enum SexualPreference {
	MEN="men",
	WOMEN="women",
	ALL="all",
	OTHER="other"
}

type ProfileInfo = {
	firstName: string;
	lastName: string;	
	gender:  Gender;
	sexualPreference: SexualPreference;
	biography: string;
};

type User = {
	id: string;
	email: string;
	username: string;
};

export { Gender, SexualPreference };
export type { ProfileInfo, User };
