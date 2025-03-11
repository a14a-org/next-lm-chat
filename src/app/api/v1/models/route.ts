import { NextResponse } from 'next/server';
import { fetchModels } from '@/services/api/apiService';
import { handleApiError } from '@/utils/errorHandling';

/**
 * GET /api/v1/models
 *
 * Returns a list of available models.
 * This endpoint is compatible with the OpenAI API.
 */
export async function GET() {
  try {
    // Fetch models using the API service
    const modelsData = await fetchModels();
    return NextResponse.json(modelsData);
  } catch (error) {
    return handleApiError(error, 'Models API');
  }
}
