import type {
    CategoriesQueryParams,
    CategoriesResponse,
    Category,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from '../types/category';
import apiClient from './axios';

export const CategoryService = {
  createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    console.log('Creating category with payload:', payload);
    const response = await apiClient.post<Category>('/api/categories', payload);
    return response.data;
  },

  getCategories: async (params?: CategoriesQueryParams): Promise<CategoriesResponse> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    console.log('Fetching categories with params:', params);
    const response = await apiClient.get<CategoriesResponse>(
      `/api/categories?${queryParams.toString()}`
    );
    console.log('Categories response:', response.data);
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/api/categories/${id}`);
    return response.data;
  },

  updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    console.log(`Updating category ${id} with payload:`, payload);
    const response = await apiClient.put<Category>(`/api/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    console.log(`Deleting category with id: ${id}`);
    await apiClient.delete(`/api/categories/${id}`);
  },
};