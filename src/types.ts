import type { ImageData } from "./utils/image-processing";

export interface MessageContent {
	type: "text" | "image_url";
	text?: string;
	image_url?: {
		url: string;
	};
}

export interface Message {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	images?: ImageData[];
	timestamp: number;
}

export interface ApiMessage {
	role: "user" | "assistant" | "system";
	content: MessageContent[] | string;
}

export interface ChatCompletionRequest {
	model: string;
	messages: Message[];
	stream?: boolean;
	max_tokens?: number;
	temperature?: number;
}

export interface ChatCompletionResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: Array<{
		index: number;
		message: ApiMessage;
		finish_reason: string;
	}>;
}
