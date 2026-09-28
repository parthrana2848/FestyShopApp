import React, { memo, useCallback } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from './Button';
import CategoryPicker from './CategoryPicker';
import TextInput from './TextInput';

import { useCategoriesQuery } from '../hooks/useCategories';
import { useProductForm, type ProductInitialData } from '../hooks/useProductForm';
import type { CreateProductPayload } from '../types/product';

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────
export type ProductModalProps = {
  /** Controls modal visibility */
  visible: boolean;
  /** Called when the user dismisses the modal without saving */
  onClose: () => void;
  /**
   * Called with the validated API payload on submit.
   * The parent is responsible for calling the mutation.
   */
  onSubmit: (payload: CreateProductPayload) => Promise<void> | void;
  /**
   * When provided the modal operates in "Edit" mode:
   * fields are pre-filled and the CTA reads "Update".
   */
  initialData?: ProductInitialData;
  /** Whether the submit action is in-flight (shows spinner on CTA) */
  isSubmitting?: boolean;
};

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const isEditMode = !!initialData;

  // ── All categories (for the picker) ──────────────────────────
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery({
    limit: 100,
  });
  const allCategories = categoriesData?.data ?? [];

  console.log("initialData from product modal ", initialData);

  // ── Form state via hook ────────────────────────────────────────
  const {
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
  } = useProductForm(initialData);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    await onSubmit(buildPayload());
    resetForm()
    onClose()
  }, [validate, buildPayload, onSubmit]);

  const handleClose = useCallback(() => {
    onClose();
    resetForm()
  }, [onClose]);
  
  
  const getCompanyName = useCallback((): string => {
  if (!fields.company) return '';

  // If it's already string (ID)
  if (typeof fields.company === 'string') {
    // Try resolving name from initialData (edit mode)
    if (initialData?.company && typeof initialData.company !== 'string') {
      if (
        initialData.company._id === fields.company ||
        initialData.company.id === fields.company
      ) {
        return initialData.company.name ?? '';
      }
    }

    // fallback → return ID or empty
    return fields.company;
  }

  // If somehow object slipped in (safety)
  return fields.company.name ?? fields.company._id ?? '';
}, [fields.company, initialData]);

const getFestivalNames = useCallback((): string => {
  if (!fields.festivals) return '';

  const ids = fields.festivals.split(',').map(i => i.trim());

  if (!initialData?.festivals) return ids.join(', ');

  return ids
    .map(id => {
      const match = initialData.festivals?.find(f =>
        typeof f === 'string'
          ? f === id
          : f._id === id || f.id === id
      );

      if (!match) return id;

      return typeof match === 'string'
        ? match
        : match.name ?? match._id ?? match.id ?? id;
    })
    .join(', ');
}, [fields.festivals, initialData]);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Product' : 'Add Product'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={HIT_SLOP}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* ── Scrollable form ─────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name */}
          <TextInput
            label="Product Name *"
            value={fields.name}
            onChangeText={v => setField('name', v)}
            placeholder="e.g. Wireless Headphones"
            error={errors.name}
          />

          {/* Company */}
          <TextInput
            label="Company *"
            editable={false}
            // value={fields.company?.toString()}
            value={getCompanyName()} // ✅ show name
            onChangeText={v => setField('company', v)}
            placeholder="e.g. Sony"
            error={errors.company}
          />

          {/* Price */}
          <TextInput
            label="Price *"
            value={fields.price}
            onChangeText={v => setField('price', v)}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.price}
          />

          {/* Stock */}
          <TextInput
            label="Stock *"
            value={fields.stock}
            onChangeText={v => setField('stock', v)}
            placeholder="0"
            keyboardType="number-pad"
            error={errors.stock}
          />

          {/* ── Categories (multi-select) ──────────────────────── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Categories *</Text>

            <CategoryPicker
              categories={allCategories}
              isLoading={categoriesLoading}
              selectedIds={selectedCategoryIds}
              isVisible={isCategoryPickerVisible}
              onToggle={toggleCategory}
              onRemove={removeCategory}
              onClear={clearCategories}
              onOpen={openCategoryPicker}
              onClose={closeCategoryPicker}
              getCategoryName={getCategoryName}
            />

            {/* Inline error for categories */}
            {!!errors.categories && (
              <Text style={styles.fieldError}>{errors.categories}</Text>
            )}
          </View>

          {/* Festivals (optional) */}
          <TextInput
            label="Festivals (optional, comma-separated IDs)"
            // value={fields.festivals}
            editable={false}
            value={getFestivalNames()}
            onChangeText={v => setField('festivals', v)}
            placeholder="e.g. diwali, christmas"
          />

          {/* ── Attributes ────────────────────────────────────── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Attributes</Text>

            {attributes.map((attr, index) => (
              <View key={index} style={styles.attrRow}>
                <TextInput
                  placeholder="Key"
                  value={attr.key}
                  onChangeText={t => updateAttribute(index, 'key', t)}
                  containerStyle={styles.attrInput}
                />
                <TextInput
                  placeholder="Value"
                  value={attr.value}
                  onChangeText={t => updateAttribute(index, 'value', t)}
                  containerStyle={styles.attrInput}
                />
                <TouchableOpacity
                  style={styles.attrRemoveBtn}
                  onPress={() => removeAttribute(index)}
                  hitSlop={HIT_SLOP}
                >
                  <Text style={styles.attrRemoveText}>−</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addAttrBtn} onPress={addAttribute}>
              <Text style={styles.addAttrText}>+ Add Attribute</Text>
            </TouchableOpacity>
          </View>

          {/* ── Actions ───────────────────────────────────────── */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={handleClose}
              style={styles.actionBtn}
            />
            <Button
              title={isEditMode ? 'Update' : 'Create'}
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 } as const;

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#555',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Generic field group
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  fieldError: {
    color: '#d9534f',
    fontSize: 13,
    marginTop: 6,
  },

  // Attributes
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  attrInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  attrRemoveBtn: {
    backgroundColor: '#FF3B30',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attrRemoveText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  addAttrBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addAttrText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionBtn: {
    flex: 1,
  },
});

export default memo(ProductModal);
