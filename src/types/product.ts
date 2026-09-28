/** Shape returned by the API when relations are populated */
export type PopulatedRef = { _id: string; id?: string; name: string };

export type Product = {
  _id: string;
  id: string;
  name: string;
  /** May be a plain ID string or a populated object depending on the API response */
  categories: Array<string | PopulatedRef>;
  /** May be a plain ID string or a populated object depending on the API response */
  // company: string | PopulatedRef;
  company?: string;
  /** May be plain ID strings or populated objects depending on the API response */
  festivals: Array<string | PopulatedRef>;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductPayload = {
  name: string;
  categories: string[];
  company?: string;
  festivals?: string[];
  price: number;
  stock: number;
  attributes?: Record<string, string>;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export type ProductsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string;
  festival?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
};

export type ProductsResponse = {
  data: Product[];
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
}

export type ProductFormData = {
  name: string;
  categories: string[];
  company: string;
  festivals: string[];
  price: string; // Keep as string for form input
  stock: string; // Keep as string for form input
  attributes: Array<{ key: string; value: string }>;
};