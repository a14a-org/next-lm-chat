/**
 * Error Handling Utilities
 *
 * This file provides standardized error handling functions for the application.
 */

import { NextResponse } from "next/server";
import type { ApiError } from "../types/index";

/**
 * Error type constants
 */
export const ERROR_TYPES = {
	INVALID_REQUEST: "invalid_request_error",
	API_ERROR: "api_error",
	AUTHENTICATION_ERROR: "authentication_error",
	SERVER_ERROR: "server_error",
};

/**
 * Error code constants
 */
export const ERROR_CODES = {
	INVALID_REQUEST: "invalid_request",
	EXTERNAL_API_ERROR: "external_api_error",
	MISSING_API_KEY: "missing_api_key",
	SERVER_ERROR: "server_error",
};

/**
 * Create a standardized API error response
 *
 * @param message - Error message
 * @param type - Error type
 * @param code - Error code
 * @param status - HTTP status code
 * @returns NextResponse with formatted error
 */
export function createErrorResponse(
	message: string,
	type: string = ERROR_TYPES.SERVER_ERROR,
	code: string = ERROR_CODES.SERVER_ERROR,
	status: number = 500,
): NextResponse {
	const error: ApiError = {
		message,
		type,
		code,
	};

	return NextResponse.json({ error }, { status });
}

/**
 * Create an invalid request error response
 *
 * @param message - Error message
 * @returns NextResponse with invalid request error
 */
export function createInvalidRequestError(message: string): NextResponse {
	return createErrorResponse(
		message,
		ERROR_TYPES.INVALID_REQUEST,
		ERROR_CODES.INVALID_REQUEST,
		400,
	);
}

/**
 * Create an authentication error response
 *
 * @param message - Error message
 * @returns NextResponse with authentication error
 */
export function createAuthenticationError(message: string): NextResponse {
	return createErrorResponse(
		message,
		ERROR_TYPES.AUTHENTICATION_ERROR,
		ERROR_CODES.MISSING_API_KEY,
		401,
	);
}

/**
 * Create an API error response
 *
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with API error
 */
export function createApiError(
	message: string,
	status: number = 500,
): NextResponse {
	return createErrorResponse(
		message,
		ERROR_TYPES.API_ERROR,
		ERROR_CODES.EXTERNAL_API_ERROR,
		status,
	);
}

/**
 * Handle errors in API routes
 *
 * @param error - The error object
 * @param context - Additional context about where the error occurred
 * @returns NextResponse with appropriate error details
 */
export function handleApiError(
	error: unknown,
	context: string = "API",
): NextResponse {
	console.error(`Error in ${context}:`, error);

	// If it's already a NextResponse, return it
	if (error instanceof NextResponse) {
		return error;
	}

	// If it's an Error object
	if (error instanceof Error) {
		return createErrorResponse(
			`${context} error: ${error.message}`,
			ERROR_TYPES.SERVER_ERROR,
			ERROR_CODES.SERVER_ERROR,
			500,
		);
	}

	// Default generic error
	return createErrorResponse(
		`An unexpected error occurred in ${context}`,
		ERROR_TYPES.SERVER_ERROR,
		ERROR_CODES.SERVER_ERROR,
		500,
	);
}
