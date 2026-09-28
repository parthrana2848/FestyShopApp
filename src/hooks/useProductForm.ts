import { useCallback, useEffect, useState } from 'react';
import type { Category } from '../types/category';
import type { CreateProductPayload, PopulatedRef } from '../types/product';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type ProductFormField = {
  name: string;
  company: string | PopulatedRef;        // ✅ ID only
  price: string;
  stock: string;
  festivals: string; // comma-separated text
};

export type AttributeEntry = { key: string; value: string };

export type ProductFormErrors = Partial<Record<keyof ProductFormField | 'categories', string>>;

export type ProductInitialData = {
  name?: string;
  /** Categories can be IDs (strings) or populated objects */
  categories?: Array<string | PopulatedRef>;
  company?: string | PopulatedRef;
  festivals?: Array<string | PopulatedRef>;
  price?: number;
  stock?: number;
  attributes?: Record<string, string>;
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const toId = (v: string | PopulatedRef | undefined): string => {
  if (!v) return '';
  if (typeof v === 'string') return v.trim();
  return (v._id ?? v.id ?? '').trim();
};

export const toName = (v: string | PopulatedRef | undefined): string => {
  console.log(' toName', v)
  if (!v) return '';
  if (typeof v === 'string') return v.trim();
  return (v.name ?? v._id ?? v.id ?? '').trim();
};


const toIdArray = (arr: Array<string | PopulatedRef> | undefined): string[] =>
  (arr ?? []).map(toId).filter(Boolean);

const toNameArray = (arr: Array<string | PopulatedRef> | undefined): string[] =>
  (arr ?? []).map(toName).filter(Boolean);

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────


const getInitialState = (initialData?: ProductInitialData) => ({
  name: '',
  company: '',
  price: '',
  stock: '',
  festivals: '',
});


export const useProductForm = (initialData?: ProductInitialData) => {
  // ── Field state ────────────────────────────────────────────────
  const [fields, setFields] = useState<ProductFormField>(getInitialState(initialData));


  // ── Category picker state ──────────────────────────────────────
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);

  // ── Attribute rows ─────────────────────────────────────────────
  const [attributes, setAttributes] = useState<AttributeEntry[]>([]);

  // ── Errors ────────────────────────────────────────────────────
  const [errors, setErrors] = useState<ProductFormErrors>({});

  // ─────────────────────────────────────────────────────────────
  // Pre-fill when initialData changes (Edit mode)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialData) {
      // Reset when no initial data (Create mode)
      setFields({ name: '', company: "", price: '', stock: '', festivals: '' });
      setSelectedCategoryIds([]);
      setAttributes([]);
      setErrors({});
      return;
    }

    console.log("initialData from useProductForm ", initialData)
    setFields({
      name: initialData.name ?? '',
      company: initialData.company ?? '', // ✅ store ID
      price: initialData.price != null ? String(initialData.price) : '',
      stock: initialData.stock != null ? String(initialData.stock) : '',
      festivals: toIdArray(initialData.festivals).join(','), // ✅ IDs
    });

    setSelectedCategoryIds(toIdArray(initialData.categories as any));

    setAttributes(
      Object.entries(initialData.attributes ?? {}).map(([key, value]) => ({ key, value })),
    );

    setErrors({});
  }, [initialData]);

  // ─────────────────────────────────────────────────────────────
  // Field change handlers
  // ─────────────────────────────────────────────────────────────
  const setField = useCallback(<K extends keyof ProductFormField>(key: K, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
    // Clear error on change
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }, []);


  // ─────────────────────────────────────────────────────────────
  // Category picker handlers
  // ─────────────────────────────────────────────────────────────
  const toggleCategory = useCallback((id: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
    setErrors(prev => ({ ...prev, categories: undefined }));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setSelectedCategoryIds(prev => prev.filter(c => c !== id));
  }, []);

  const clearCategories = useCallback(() => setSelectedCategoryIds([]), []);
  const openCategoryPicker = useCallback(() => setIsCategoryPickerVisible(true), []);
  const closeCategoryPicker = useCallback(() => setIsCategoryPickerVisible(false), []);

  const getCategoryName = useCallback(
    (id: string, categories: Category[]): string =>
      categories.find(c => c._id === id || c.id === id)?.name ?? id,
    [],
  );

  // ✅ ADD THIS
  const resetForm = useCallback(() => {
    setFields(getInitialState(undefined)); // always reset to empty
    clearCategories();
    // reset attributes if needed
  }, [clearCategories]);

  // ─────────────────────────────────────────────────────────────
  // Attribute handlers
  // ─────────────────────────────────────────────────────────────
  const addAttribute = useCallback(() => {
    setAttributes(prev => [...prev, { key: '', value: '' }]);
  }, []);

  const updateAttribute = useCallback((index: number, field: 'key' | 'value', text: string) => {
    setAttributes(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: text };
      return next;
    });
  }, []);

  const removeAttribute = useCallback((index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const next: ProductFormErrors = {};

    if (!fields.name.trim()) next.name = 'Product name is required';
    // if (!fields.company.trim()) next.company = 'Company is required';

    const price = parseFloat(fields.price);
    if (!fields.price.trim()) next.price = 'Price is required';
    else if (isNaN(price) || price < 0) next.price = 'Enter a valid positive price';

    const stock = parseInt(fields.stock, 10);
    if (!fields.stock.trim()) next.stock = 'Stock is required';
    else if (isNaN(stock) || stock < 0 || !Number.isInteger(stock))
      next.stock = 'Enter a valid non-negative integer';

    if (selectedCategoryIds.length === 0) next.categories = 'Select at least one category';

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [fields, selectedCategoryIds]);

  const getCompanyId = (
    company: string | { _id?: string; id?: string }
  ): string | undefined => {
    if (!company) return '';

    if (typeof company === 'string') return company;

    return company._id || company.id;
  };

  // ─────────────────────────────────────────────────────────────
  // Build API payload
  // ─────────────────────────────────────────────────────────────
  const buildPayload = useCallback((): CreateProductPayload => {
    const festivalIds = fields?.festivals
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const attrMap = attributes.reduce<Record<string, string>>((acc, { key, value }) => {
      if (key.trim() && value.trim()) acc[key.trim()] = value.trim();
      return acc;
    }, {});

    const companyId = getCompanyId(fields.company);

    return {
      name: fields.name.trim(),
      company: companyId,
      price: parseFloat(fields.price),
      stock: parseInt(fields.stock, 10),
      categories: selectedCategoryIds,
      festivals: festivalIds,
      attributes: attrMap,
    };
  }, [fields, selectedCategoryIds, attributes]);

  return {
    fields,
    setField,
    errors,

    selectedCategoryIds,
    isCategoryPickerVisible,
    toggleCategory,
    removeCategory,
    clearCategories,
    openCategoryPicker,
    closeCategoryPicker,
    getCategoryName,

    attributes,
    addAttribute,
    updateAttribute,
    removeAttribute,

    validate,
    buildPayload,
    resetForm, // ✅ expose this
  };
};
