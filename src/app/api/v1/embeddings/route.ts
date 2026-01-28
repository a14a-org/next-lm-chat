import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		if (!body.model || !body.input) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid request. Must include model and input.",
						type: "invalid_request_error",
						code: "invalid_request",
					},
				},
				{ status: 400 },
			);
		}

		// In a real implementation, this would forward the request to your OpenAI-compatible backend
		// For now, we'll return mock embeddings

		// Convert input to array if it's a string
		const inputs = Array.isArray(body.input) ? body.input : [body.input];

		// Generate mock embeddings (random values)
		const mockEmbeddings = inputs.map((_input: string, index: number) => {
			// Generate 1536 random values between -1 and 1 (typical embedding dimension)
			const embedding = Array(10)
				.fill(0)
				.map(() => Math.random() * 2 - 1);

			return {
				object: "embedding",
				embedding,
				index,
			};
		});

		const mockResponse = {
			object: "list",
			data: mockEmbeddings,
			model: body.model,
			usage: {
				prompt_tokens: inputs.reduce(
					(acc: number, input: string) => acc + input.length,
					0,
				),
				total_tokens: inputs.reduce(
					(acc: number, input: string) => acc + input.length,
					0,
				),
			},
		};

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 200));

		return NextResponse.json(mockResponse);
	} catch (error) {
		console.error("Error handling embeddings:", error);

		return NextResponse.json(
			{
				error: {
					message: "An error occurred while processing your request.",
					type: "server_error",
					code: "internal_server_error",
				},
			},
			{ status: 500 },
		);
	}
}
