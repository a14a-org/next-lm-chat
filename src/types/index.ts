export interface Message {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
	thinking?: {
		content: string;
		completed: boolean;
	};
}

export interface Conversation {
	id: string;
	title: string;
	messages: Message[];
	model: string;
	createdAt: number;
	updatedAt: number;
}

export interface Model {
	id: string;
	name: string;
}

export interface ApiError {
	message: string;
	type: string;
	code: string;
}

export interface CompletionRequest {
	model: string;
	prompt: string;
	max_tokens?: number;
	temperature?: number;
}

export interface ChatCompletionRequest {
	model: string;
	messages: Pick<Message, "role" | "content">[];
	temperature?: number;
	max_tokens?: number;
	stream?: boolean;
}

export interface EmbeddingRequest {
	model: string;
	input: string | string[];
}
