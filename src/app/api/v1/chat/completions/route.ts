import { type NextRequest, NextResponse } from "next/server";
import { createChatCompletion } from "@/services/api/apiService";
import type { ChatCompletionRequest } from "@/types";
import {
	createInvalidRequestError,
	handleApiError,
} from "@/utils/errorHandling";

/**
 * POST /api/v1/chat/completions
 *
 * Creates a chat completion for the provided messages.
 * This endpoint is compatible with the OpenAI API.
 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as ChatCompletionRequest;

		// Validate request body
		if (!body.model || !body.messages || !Array.isArray(body.messages)) {
			return createInvalidRequestError(
				"Invalid request. Must include model and messages array.",
			);
		}

		// Handle streaming requests
		const isStream = body.stream === true;

		// Call the API service to create chat completion
		const result = await createChatCompletion(body, isStream);

		// If streaming, return the response as is
		if (isStream && result instanceof Response) {
			// Log that we're handling a streaming response
			console.log("Handling streaming response from API");

			// Return the stream directly with appropriate headers
			return new NextResponse(result.body, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache, no-transform",
					Connection: "keep-alive",
					"X-Accel-Buffering": "no", // Prevents buffering by proxies
				},
			});
		}

		// For non-streaming responses, return the JSON result
		return NextResponse.json(result);
	} catch (error) {
		return handleApiError(error, "Chat Completions API");
	}
}
