// ============================================================
// Section Service — wraps all Section API calls
// API URL: GET /api/sections?page=1&limit=10
// Defined in api-guide.http (Section APIs section)
// Pattern follows existing categoryService.ts / productService.ts
// ============================================================

import type { SectionsResponse } from '../types/section';
import apiClient from './axios';

export interface SectionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const SectionService = {
  /**
   * Fetch a paginated list of sections.
   * Endpoint: GET /api/sections?page=1&limit=10
   * Documented in api-guide.http → "2. List Sections [PUBLIC/USER]"
   *
   * DO NOT modify this URL — it matches the api-guide.http spec exactly.
   */
  getSections: async (params?: SectionsQueryParams): Promise<SectionsResponse> => {
    // Build query string from optional params, mirroring categoryService pattern
    const queryParams = new URLSearchParams();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (params?.search) {
      queryParams.append('search', params.search);
    }

    console.log("apiclient", apiClient.defaults.baseURL)
    try {
      const response = await apiClient.get<SectionsResponse>(
        `/api/sections?${queryParams.toString()}`,

      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log("error from list section service ", error.response.data);
      }
      return {} as SectionsResponse;
    }


  },
};
