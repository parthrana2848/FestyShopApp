export type Category = {
  _id: string;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryPayload = {
  name: string;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type CategoriesQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export type CategoriesResponse = {
  data: Category[];
  pagination: PaginationMeta;
  message: string;
  statusCode: string;
  success: boolean;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};