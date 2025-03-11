import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.model || !body.prompt) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid request. Must include model and prompt.',
            type: 'invalid_request_error',
            code: 'invalid_request',
          },
        },
        { status: 400 }
      );
    }

    // In a real implementation, this would forward the request to your OpenAI-compatible backend
    // For now, we'll echo back with a mock response

    // Simple mock response for demonstration
    const mockResponse = {
      id: 'cmpl-' + Date.now(),
      object: 'text_completion',
      created: Math.floor(Date.now() / 1000),
      model: body.model,
      choices: [
        {
          text: `This is a mock completion for: "${body.prompt}"\n\nIn a real implementation, this would be generated by an AI model.`,
          index: 0,
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error handling completion:', error);

    return NextResponse.json(
      {
        error: {
          message: 'An error occurred while processing your request.',
          type: 'server_error',
          code: 'internal_server_error',
        },
      },
      { status: 500 }
    );
  }
}
