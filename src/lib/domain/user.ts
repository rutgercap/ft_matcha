type ProfileInfo = {
	gender: string;
	sexPreference: string;
	biography: string;
	tags: string[];
	pictures: string[];
};

type User = {
	id: string;
	email: string;
	username: string;
};

export type { ProfileInfo, User };
