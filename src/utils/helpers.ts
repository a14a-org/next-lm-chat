import type { Message } from "../types";
import type { ImageData } from "./image-processing";

/**
 * Generates a unique ID for messages, conversations, etc.
 */
export const generateId = (): string => {
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
};

/**
 * Formats a timestamp into a readable string
 * @param timestamp - Unix timestamp in milliseconds
 */
export const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Truncates a string to a specified length
 * @param str - The string to truncate
 * @param length - Maximum length
 */
export const truncateString = (str: string, length: number): string => {
	if (str.length <= length) return str;
	return `${str.substring(0, length)}...`;
};

/**
 * Creates a new chat message
 * @param role - 'user', 'assistant', or 'system'
 * @param content - The message content
 * @param images - Optional images associated with the message
 */
export const createMessage = (
	role: "user" | "assistant" | "system",
	content: string,
	images?: ImageData[],
): Message => ({
	id: generateId(),
	role,
	content,
	images,
	timestamp: Date.now(),
});

/**
 * Removes <think>...</think> tags and their content from message content
 * @param content - The message content to process
 * @returns The content with think tags and their content removed
 */
export const stripThinkTags = (content: string): string => {
	// Use regex to remove <think>...</think> and all content between them
	return content.replace(/<think>[\s\S]*?<\/think>/g, "");
};
