export const tagList: string[] = ["Circuit Seductress",
                                            "Binary Bondage",
                                            "Mecha Masochist",
                                            "Neon Noir Lover",
                                            "Robo-Submissive",
                                            "Cyber-Domme",
                                            "Holo-Heartbreaker",
                                            "Chrome Fetishist",
                                            "Algorithmic Admirer",
                                            "Electric Tease",
                                            "AI Voyeur",
                                            "Transhuman Temptress",
                                            "Synthetic Sensualist",
                                            "Neural Link Lover",
                                            "Code Craver",
                                            "Techno Temptation",
                                            "Quantum Kinkster",
                                            "Firmware Flirt",
                                            "Augmentation Arousal",
                                            "Digital Deviant"
                                            ];

export const averages = {
    'average_views':5,
    'average_likes':1,
    'average_match':0.5,
}

export const fameRatingWeights = {
    'views' : 0.2,
    'likes' : 0.5,
    'match' : 0.9,
}

export const scoreWeights = {
    'fameRating' : 0.2,
    'tags' : 0.5,
    'distance' : 0.9,
}

export type BrowsingInfo = {
	id: string;
	gender: string;
	fameRate: number;
	localisation: number;
	score: number;
	sexualPreferences: string;
};

export type CommonTagStats = {
    commonTag: number;
    ntagsUser1: number;
    ntagsUser2: number;
}

export type ReducedProfileInfo = {
	userName: string;
	biography: string;
	gender: string;
	age: number;
	fameRate: number;
	localisation: number;
	mask: boolean;
};
