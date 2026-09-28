import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Category } from '../types/category';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
type Props = {
  /** All available categories fetched from the API */
  categories: Category[];
  /** Whether categories are loading */
  isLoading: boolean;
  /** Currently selected category IDs */
  selectedIds: string[];
  /** Modal visibility */
  isVisible: boolean;
  /** Toggle one ID in/out of the selection */
  onToggle: (id: string) => void;
  /** Remove one selected chip */
  onRemove: (id: string) => void;
  /** Clear all selections */
  onClear: () => void;
  /** Open the picker modal */
  onOpen: () => void;
  /** Close the picker modal */
  onClose: () => void;
  /** Resolve display name for a selected ID */
  getCategoryName: (id: string, categories: Category[]) => string;
};

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

type ChipProps = {
  label: string;
  onRemove: () => void;
};

const Chip = memo(({ label, onRemove }: ChipProps) => (
  <View style={styles.chip}>
    <Text style={styles.chipLabel} numberOfLines={1}>
      {label}
    </Text>
    <TouchableOpacity onPress={onRemove} hitSlop={HIT_SLOP} style={styles.chipClose}>
      <Text style={styles.chipCloseIcon}>✕</Text>
    </TouchableOpacity>
  </View>
));

type RowProps = {
  item: Category;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

const CategoryRow = memo(({ item, isSelected, onToggle }: RowProps) => {
  const id = item._id || item.id;
  const handlePress = useCallback(() => onToggle(id), [id, onToggle]);

  return (
    <TouchableOpacity
      style={[styles.row, isSelected && styles.rowSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.rowLabel, isSelected && styles.rowLabelSelected]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

const CategoryPicker: React.FC<Props> = ({
  categories,
  isLoading,
  selectedIds,
  isVisible,
  onToggle,
  onRemove,
  onClear,
  onOpen,
  onClose,
  getCategoryName,
}) => {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [search, categories]);

  const renderRow = useCallback(
    ({ item }: { item: Category }) => {
      const id = item._id || item.id;
      return (
        <CategoryRow
          item={item}
          isSelected={selectedIds.includes(id)}
          onToggle={onToggle}
        />
      );
    },
    [selectedIds, onToggle],
  );

  const keyExtractor = useCallback(
    (item: Category) => item._id || item.id,
    [],
  );

  const handleClose = useCallback(() => {
    setSearch('');
    onClose();
  }, [onClose]);

  const hasSelection = selectedIds.length > 0;

  return (
    <>
      {/* ── Trigger row ────────────────────────────────────────── */}
      <View style={styles.triggerWrapper}>
        <TouchableOpacity
          style={[styles.trigger, hasSelection && styles.triggerActive]}
          onPress={onOpen}
          activeOpacity={0.8}
        >
          <Text style={[styles.triggerText, hasSelection && styles.triggerTextActive]}>
            {hasSelection
              ? `Categories (${selectedIds.length})`
              : 'Filter by Category ▾'}
          </Text>
        </TouchableOpacity>

        {hasSelection && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearButton}
            hitSlop={HIT_SLOP}
          >
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Selected chips ─────────────────────────────────────── */}
      {hasSelection && (
        <View style={styles.chipsRow}>
          {selectedIds.map(id => (
            <Chip
              key={id}
              label={getCategoryName(id, categories)}
              onRemove={() => onRemove(id)}
            />
          ))}
        </View>
      )}

      {/* ── Picker modal ───────────────────────────────────────── */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Categories</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories…"
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
              autoCorrect={false}
            />
          </View>

          {/* Selection summary */}
          {hasSelection && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {selectedIds.length} selected
              </Text>
              <TouchableOpacity onPress={onClear} hitSlop={HIT_SLOP}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List / loading / empty */}
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading categories…</Text>
            </View>
          ) : filteredCategories.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCategories}
              renderItem={renderRow}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Trigger
  triggerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trigger: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  triggerActive: {
    borderColor: '#007AFF',
    backgroundColor: '#EFF6FF',
  },
  triggerText: {
    fontSize: 14,
    color: '#888',
  },
  triggerTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 4,
  },
  clearText: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '500',
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4,
    maxWidth: 160,
  },
  chipLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  chipClose: {
    marginLeft: 4,
    padding: 2,
  },
  chipCloseIcon: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Modal
  modal: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  modalClose: {
    paddingHorizontal: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },

  // Search
  searchWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111',
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  summaryText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },

  // List
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  rowSelected: {
    backgroundColor: '#EFF6FF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#c0c0c0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rowLabel: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  rowLabelSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
});

export default memo(CategoryPicker);
