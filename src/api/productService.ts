import type {
  CreateProductPayload,
  Product,
  ProductsQueryParams,
  ProductsResponse,
  UpdateProductPayload,
} from '../types/product';
import apiClient from './axios';

export class ProductService {
  static async createProduct(payload: CreateProductPayload): Promise<Product> {
    console.log('Creating product with payload:', payload);
    const response = await apiClient.post<Product>('/api/products', payload);
    console.log("got response", response.data);
    return response.data;
  }

  static async getProducts(params?: ProductsQueryParams): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    console.log('Fetching products with params:', params);
    console.log('Constructed query params:', queryParams.toString());
    console.log('API Base URL:', JSON.stringify(apiClient.defaults.baseURL));
    const response = await apiClient.get<ProductsResponse>(
      `/api/products?${queryParams.toString()}`
    );
    console.log('Products response:', response.data);
    return response.data;
  }

  static async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/api/products/${id}`);
    return response.data;
  }

  static async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    console.log(`Updating product ${id} with payload:`, payload);
    const response = await apiClient.put<Product>(`/api/products/${id}`, payload);
    return response.data;
  }

  static async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/api/products/${id}`);
  }
}