export type Chat = {
	id: number;
	userOne: string;
	userTwo: string;
	messages: Message[];
};

export type ChatPreview = {
	id: number;
	userOne: string;
	userTwo: string;
	lastMessage?: Message;
};

export type Message = {
	id: number;
	chatId: number;
	sender: string;
	message: string;
	sentAt: Date;
};
