import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { ProductService } from '../api/productService';
import type {
  CreateProductPayload,
  ProductsQueryParams,
  UpdateProductPayload
} from '../types/product';

const PRODUCTS_QUERY_KEY = 'products';

// Query for fetching products list
export const useProductsQuery = (params?: ProductsQueryParams) => {
  return useInfiniteQuery({
    queryKey: [PRODUCTS_QUERY_KEY, params],
    queryFn: ({ pageParam = 1 }) => ProductService.getProducts({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Query for fetching single product
export const useProductQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, 'single', id],
    queryFn: () => ProductService.getProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutation for creating product
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => ProductService.createProduct(payload),
    onSuccess: (newProduct) => {
      console.log("newProduct in hook onsuccess", newProduct);
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });

      // Optimistically add to cache
      // queryClient.setQueryData(
      //   [PRODUCTS_QUERY_KEY, { page: 1, limit: 10 }],
      //   (oldData: any) => {
      //     if (!oldData) return oldData;
      //     return {
      //       ...oldData,
      //       products: [newProduct.data, ...oldData.products],
      //       total: oldData.total + 1,
      //     };
      //   }
      // );

      Alert.alert('Success', 'Product created successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to create product');
    },
  });
};

// Mutation for updating product
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      ProductService.updateProduct(id, payload),
    onSuccess: (updatedProduct) => {

      console.log("updatedProduct in hook onsuccess", updatedProduct);
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });

      console.log("updatedProduct in hook", updatedProduct);
      // Update single product cache
      queryClient.setQueryData(
        [PRODUCTS_QUERY_KEY, 'single', updatedProduct.id],
        updatedProduct
      );

      Alert.alert('Success', 'Product updated successfully');
    },
    onError: (error: any) => {
      console.log('Update product error:', error);
      Alert.alert('Error', error?.message || 'Failed to update product');
    },
  });
};

// Mutation for deleting product
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      console.log("deletedId in hook", deletedId);
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      // Remove from products list cache
      // queryClient.setQueryData(
      //   [PRODUCTS_QUERY_KEY],
      //   (oldData: any) => {

      //     console.log("oldData in hook", oldData);
      //     if (!oldData) return oldData;

      //     return {
      //       ...oldData,
      //       products: oldData.products.filter((p: Product) => p._id !== deletedId),
      //       total: oldData.total - 1,
      //     };
      //   }
      // );

      // // Remove single product cache
      // queryClient.removeQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'single', deletedId] });

      Alert.alert('Success', 'Product deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to delete product');
    },
  });
};