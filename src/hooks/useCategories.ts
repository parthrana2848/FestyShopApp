import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { CategoryService } from '../api/categoryService';
import type {
    CategoriesQueryParams,
    CreateCategoryPayload,
    UpdateCategoryPayload
} from '../types/category';

const CATEGORIES_QUERY_KEY = 'categories';

// Query for fetching categories list
export const useCategoriesQuery = (params?: CategoriesQueryParams) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, params],
    queryFn: () => CategoryService.getCategories(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Infinite query for fetching categories with pagination
export const useInfiniteCategoriesQuery = (search?: string) => {
  return useInfiniteQuery({
    queryKey: [CATEGORIES_QUERY_KEY, 'infinite', search],
    queryFn: ({ pageParam = 1 }) => CategoryService.getCategories({
      page: pageParam,
      limit: 10,
      search: search || undefined,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.page;
      const totalPages = lastPage.pagination.totalPages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Query for fetching single category
export const useCategoryQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, 'single', id],
    queryFn: () => CategoryService.getCategoryById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutation for creating category
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => CategoryService.createCategory(payload),
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      Alert.alert('Success', 'Category created successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to create category');
    },
  });
};

// Mutation for updating category
export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      CategoryService.updateCategory(id, payload),
    onSuccess: (updatedCategory) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      Alert.alert('Success', 'Category updated successfully');
    },
    onError: (error: any) => {
      console.log('Update category error:', error);
      Alert.alert('Error', error?.message || 'Failed to update category');
    },
  });
};

// Mutation for deleting category
export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      Alert.alert('Success', 'Category deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to delete category');
    },
  });
};