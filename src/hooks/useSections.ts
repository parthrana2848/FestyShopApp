import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { SectionService, SectionsQueryParams } from '../api/sectionService';

const SECTIONS_QUERY_KEY = 'sections';

// Query for fetching sections list (first page)
export const useSectionsQuery = (params?: SectionsQueryParams) => {
  return useQuery({
    queryKey: [SECTIONS_QUERY_KEY, params],
    queryFn: () => SectionService.getSections(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Infinite query for fetching sections with pagination
export const useInfiniteSectionsQuery = (search?: string) => {
  return useInfiniteQuery({
    queryKey: [SECTIONS_QUERY_KEY, 'infinite', search],
    queryFn: ({ pageParam = 1 }) => SectionService.getSections({
      page: pageParam,
      limit: 10,
      search: search || undefined,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta.page;
      const totalPages = lastPage.meta.totalPages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
