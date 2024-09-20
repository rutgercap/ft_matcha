export default interface User {
	id: string;
	email: string;
}


export interface ProfileInfo {
	gender: string;
	sex_preference: string;
	biography: string;
	tags: string[];
	pictures: string[];
}
