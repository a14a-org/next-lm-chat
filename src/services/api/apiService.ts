/**
 * API Service
 *
 * This service handles all interactions with the LM Studio API.
 * It provides methods for models, completions, chat completions, and embeddings.
 */

import { API_CONFIG } from "@/utils/config";
import type {
	ChatCompletionRequest,
	CompletionRequest,
	EmbeddingRequest,
} from "../../types/index";
import {
	generateMockChatCompletion,
	generateMockCompletion,
	generateMockEmbeddings,
	mockModels,
} from "./mockData";

/**
 * Check if required API configuration is available
 * @returns Object indicating if the API is configured and any error message
 */
export const checkApiConfig = () => {
	const { apiKey, apiUrl } = API_CONFIG.lmStudio;

	if (!apiKey) {
		return {
			configured: false,
			error:
				"API key is not configured. Please set LM_STUDIO_API_KEY environment variable.",
		};
	}

	if (!apiUrl) {
		return {
			configured: false,
			error:
				"API URL is not configured. Please set LM_STUDIO_API_URL environment variable.",
		};
	}

	return { configured: true, error: null };
};

/**
 * Fetch models from the API
 * @returns Models data response
 */
export const fetchModels = async () => {
	const { apiUrl, apiKey } = API_CONFIG.lmStudio;
	const { configured } = checkApiConfig();

	// If API not configured or in development with no key, return mock data
	if (!configured) {
		console.warn("Using mock models data because API is not configured");
		return mockModels;
	}

	try {
		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		// Only add Authorization if API key is defined
		if (apiKey) {
			headers.Authorization = apiKey;
		}

		const response = await fetch(`${apiUrl}/models`, {
			headers,
		});

		if (!response.ok) {
			console.warn(
				`Failed to fetch models from API: ${response.status} ${response.statusText}`,
			);
			return mockModels;
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching models from API:", error);
		return mockModels;
	}
};

/**
 * Create a text completion
 * @param request Completion request parameters
 * @returns Completion response
 */
export const createCompletion = async (request: CompletionRequest) => {
	const { apiUrl, apiKey } = API_CONFIG.lmStudio;
	const { configured } = checkApiConfig();

	// If API not configured, return mock data
	if (!configured) {
		console.warn("Using mock completion data because API is not configured");
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 300));
		return generateMockCompletion(request.model, request.prompt);
	}

	try {
		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		// Only add Authorization if API key is defined
		if (apiKey) {
			headers.Authorization = apiKey;
		}

		const response = await fetch(`${apiUrl}/completions`, {
			method: "POST",
			headers,
			body: JSON.stringify(request),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating completion:", error);
		throw error;
	}
};

/**
 * Create a chat completion
 * @param request Chat completion request parameters
 * @param useStream Whether to use streaming response
 * @returns Chat completion response or stream
 */
export const createChatCompletion = async (
	request: ChatCompletionRequest,
	useStream = false,
) => {
	const { apiUrl, apiKey } = API_CONFIG.lmStudio;
	const { configured } = checkApiConfig();

	// If API not configured, return mock data
	if (!configured) {
		console.warn(
			"Using mock chat completion data because API is not configured",
		);
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 300));
		return generateMockChatCompletion(request.model, request.messages);
	}

	try {
		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		// Only add Authorization if API key is defined
		if (apiKey) {
			headers.Authorization = apiKey;
		}

		// Add Accept header for streaming
		if (useStream) {
			headers.Accept = "text/event-stream";
		}

		console.log(
			`Making ${useStream ? "streaming" : "standard"} request to ${apiUrl}/chat/completions`,
		);

		const response = await fetch(`${apiUrl}/chat/completions`, {
			method: "POST",
			headers,
			body: JSON.stringify({
				...request,
				stream: useStream,
			}),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		// Return the response as is for streaming
		if (useStream) {
			console.log("Returning stream response from API service");
			return response;
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating chat completion:", error);
		throw error;
	}
};

/**
 * Create embeddings
 * @param request Embedding request parameters
 * @returns Embedding response
 */
export const createEmbedding = async (request: EmbeddingRequest) => {
	const { apiUrl, apiKey } = API_CONFIG.lmStudio;
	const { configured } = checkApiConfig();

	// If API not configured, return mock data
	if (!configured) {
		console.warn("Using mock embedding data because API is not configured");
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 300));
		const inputs = Array.isArray(request.input)
			? request.input
			: [request.input];
		return generateMockEmbeddings(request.model, inputs);
	}

	try {
		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		// Only add Authorization if API key is defined
		if (apiKey) {
			headers.Authorization = apiKey;
		}

		const response = await fetch(`${apiUrl}/embeddings`, {
			method: "POST",
			headers,
			body: JSON.stringify(request),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating embedding:", error);
		throw error;
	}
};
