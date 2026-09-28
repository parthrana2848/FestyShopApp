import { useCallback, useMemo, useState } from 'react';
import type { Category } from '../types/category';

export type CategoryFilterState = {
  /** Currently selected category IDs */
  selectedIds: string[];
  /** Comma-separated IDs ready to pass to the API */
  categoryParam: string | undefined;
  /** Whether the picker modal is open */
  isPickerVisible: boolean;
  /** Toggle a single category in/out of the selection */
  toggleCategory: (id: string) => void;
  /** Remove a single category chip */
  removeCategory: (id: string) => void;
  /** Clear all selected categories */
  clearCategories: () => void;
  /** Open the picker modal */
  openPicker: () => void;
  /** Close the picker modal */
  closePicker: () => void;
  /** Resolve human-readable name for a selected ID */
  getCategoryName: (id: string, categories: Category[]) => string;
};

/**
 * Manages multi-select category filter state.
 * API calls and product list updates are driven reactively by `categoryParam`.
 */
export const useCategoryFilter = (): CategoryFilterState => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const categoryParam = useMemo(
    () => (selectedIds.length > 0 ? selectedIds.join(',') : undefined),
    [selectedIds],
  );

  const toggleCategory = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
  }, []);

  const removeCategory = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(c => c !== id));
  }, []);

  const clearCategories = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const openPicker = useCallback(() => setIsPickerVisible(true), []);
  const closePicker = useCallback(() => setIsPickerVisible(false), []);

  const getCategoryName = useCallback(
    (id: string, categories: Category[]): string =>
      categories.find(c => c._id === id || c.id === id)?.name ?? id,
    [],
  );

  return {
    selectedIds,
    categoryParam,
    isPickerVisible,
    toggleCategory,
    removeCategory,
    clearCategories,
    openPicker,
    closePicker,
    getCategoryName,
  };
};
