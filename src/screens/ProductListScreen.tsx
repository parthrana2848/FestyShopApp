import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import CategoryPicker from '../components/CategoryPicker';
import ProductModal from '../components/ProductModal';
import TextInput from '../components/TextInput';
import { useCart } from '../context/CartContext';
import { useCategoriesQuery } from '../hooks/useCategories';
import { useCategoryFilter } from '../hooks/useCategoryFilter';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useProductsQuery,
  useUpdateProductMutation
} from '../hooks/useProducts';
import type { RootStackParamList } from '../types/navigation';
import type { CreateProductPayload, PopulatedRef, Product, ProductsQueryParams } from '../types/product';

type ProductListScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

function ProductListScreen({ navigation }: ProductListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Cart context
  const { cart, addToCart } = useCart();

  // Multi-select category filter (for the list)
  const categoryFilter = useCategoryFilter();

  // All categories for the list filter picker
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery({ limit: 100 });
  const allCategories = categoriesData?.data ?? [];

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query parameters
  const queryParams: ProductsQueryParams = useMemo(() => ({
    limit: 10,
    search: debouncedSearch || undefined,
    categories: categoryFilter.categoryParam,
    company: selectedCompany || undefined,
  }), [debouncedSearch, categoryFilter.categoryParam, selectedCompany]);

  // Queries and mutations
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useProductsQuery(queryParams);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  // Set cart icon in header
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.cartIconContainer}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cart.totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, cart.totalItems]);

  // ── Resolve display helpers (used only inside renderProductItem) ──
  const resolveStringValue = (value: string | PopulatedRef | undefined): string => {
    if (!value) return '';
    return typeof value === 'string' ? value : value.name || '';
  };

  const resolveStringArray = (values: Array<string | PopulatedRef> | undefined): string[] => {
    if (!values) return [];
    return values.map(v => resolveStringValue(v));
  };

  // ── Modal submit handler ──────────────────────────────────────
  const handleModalSubmit = useCallback(async (payload: CreateProductPayload) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct._id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setModalVisible(false);
      setEditingProduct(null);
    } catch {
      // Errors handled by the mutation (e.g. toast/alert in mutation onError)
    }
  }, [editingProduct, createMutation, updateMutation]);

  // ── Open create modal ─────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingProduct(null);
    setModalVisible(true);
  }, []);

  // ── Open edit modal ───────────────────────────────────────────
  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setModalVisible(true);
  }, []);

  // ── Close modal ───────────────────────────────────────────────
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingProduct(null);
  }, []);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = useCallback((product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(product._id),
        },
      ]
    );
  }, [deleteMutation]);

  // ── Refresh ───────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ── Load more ─────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Add to cart ────────────────────────────────────────────────
  const handleAddToCart = useCallback((product: Product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
    });
    Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
  }, [addToCart]);

  const renderProductItem = useCallback(({ item }: { item: Product }) => {
    const companyLabel = resolveStringValue(item.company);
    const categories = resolveStringArray(item.categories);
    const festivals = resolveStringArray(item.festivals);
    const attributeEntries = Object.entries(item.attributes || {});

    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price}</Text>
        </View>

        {companyLabel && <Text style={styles.productCompany}>{companyLabel}</Text>}

        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <View key={`${category}-${index}`} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>

        {festivals.length > 0 && (
          <View style={styles.categoriesContainer}>
            {festivals.map((festival, index) => (
              <View key={`${festival}-${index}`} style={styles.festivalTag}>
                <Text style={styles.categoryText}>{festival}</Text>
              </View>
            ))}
          </View>
        )}

        {attributeEntries.length > 0 && (
          <View style={styles.attributesList}>
            {attributeEntries.map(([key, value]) => (
              <View key={key} style={styles.attributeItem}>
                <Text style={styles.attributeKey}>{key}:</Text>
                <Text style={styles.attributeValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.productFooter}>
          <Text style={styles.stockText}>Stock: {item.stock}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cartButton]}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEdit(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [handleEdit, handleDelete, handleAddToCart]);

  // Render empty state
  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No products found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
    </View>
  ), []);

  // Render loading state
  const renderLoading = useCallback(() => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  ), []);

  // Render error state
  const renderError = useCallback(() => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load products</Text>
      <Button title="Retry" onPress={() => refetch()} />
    </View>
  ), [refetch]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
          <Text style={styles.addButtonText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <TextInput
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />

        {/* Multi-select category picker */}
        <CategoryPicker
          categories={allCategories}
          isLoading={categoriesLoading}
          selectedIds={categoryFilter.selectedIds}
          isVisible={categoryFilter.isPickerVisible}
          onToggle={categoryFilter.toggleCategory}
          onRemove={categoryFilter.removeCategory}
          onClear={categoryFilter.clearCategories}
          onOpen={categoryFilter.openPicker}
          onClose={categoryFilter.closePicker}
          getCategoryName={categoryFilter.getCategoryName}
        />

        {/* Company filter */}
        <TextInput
          placeholder="Filter by company"
          value={selectedCompany}
          onChangeText={setSelectedCompany}
          containerStyle={styles.companyFilterInput}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={data?.pages.flatMap(page => page.data) || []}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => item.id ?? (item as any)._id ?? String(index)}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={isLoading ? renderLoading : renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Create / Edit Product Modal */}
      <ProductModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        initialData={editingProduct ?? undefined}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cartIconContainer: {
    paddingHorizontal: 12,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    marginBottom: 12,
  },
  companyFilterInput: {
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  productCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  festivalTag: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  attributesList: {
    marginBottom: 12,
  },
  attributeItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  attributeKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  attributeValue: {
    fontSize: 12,
    color: '#666',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cartButton: {
    backgroundColor: '#34C759',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});

export default ProductListScreen;
