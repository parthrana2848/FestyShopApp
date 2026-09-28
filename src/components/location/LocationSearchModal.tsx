import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocation } from '../../hooks/useLocation';
import { LocationSearchResult, StoryLocation } from '../../types/location.types';
import { GeocodingService } from '../../services/location/geocoding.service';

interface LocationSearchModalProps {
  /** Visibility state of the modal view. */
  visible: boolean;
  /** Callback triggered when a location is successfully selected or created. */
  onSelectLocation: (location: StoryLocation) => void;
  /** Callback triggered when the modal is closed without selection. */
  onClose: () => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = React.memo(({
  visible,
  onSelectLocation,
  onClose,
}) => {
  const { loading, fetchCurrentLocation, searchLocation } = useLocation();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  // Debounced search logic: search only if query stabilizes for 400ms
  useEffect(() => {
    if (!visible) return;

    if (query.trim().length === 0) {
      setResults(GeocodingService.getNearbySuggestions());
      return;
    }

    const delayDebounce = setTimeout(async () => {
      const searchResults = await searchLocation(query);
      setResults(searchResults);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, searchLocation, visible]);

  // Reset inputs when modal becomes visible
  useEffect(() => {
    if (visible) {
      setQuery('');
      setResults(GeocodingService.getNearbySuggestions());
    }
  }, [visible]);

  /**
   * Triggers the geolocator to fetch the device's precise current GPS position
   * and geocodes it, returning coordinates and landmark name.
   */
  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const currentLoc = await fetchCurrentLocation();
      if (currentLoc) {
        onSelectLocation(currentLoc);
      }
    } finally {
      setGpsLoading(false);
    }
  };

  /**
   * Handles selection of an autocompleted place item.
   */
  const handleItemPress = (item: LocationSearchResult) => {
    onSelectLocation({
      latitude: item.latitude,
      longitude: item.longitude,
      placeName: item.placeName,
    });
  };

  const renderItem = ({ item }: { item: LocationSearchResult }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.resultItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.pinWrapper}>
        <Text style={styles.pinIcon}>📍</Text>
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.placeName.split(',')[0]}
        </Text>
        <Text style={styles.fullAddress} numberOfLines={1}>
          {item.placeName.split(',').slice(1).join(',').trim() || 'Tagged Location'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Row */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Tag Location</Text>
            <View style={styles.placeholderHeaderBtn} />
          </View>

          {/* Search Box Container */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.input}
              placeholder="Search Location..."
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
              value={query}
              onChangeText={setQuery}
              autoFocus={true}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {/* GPS Quick Action Button */}
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleUseCurrentLocation}
            disabled={gpsLoading}
            activeOpacity={0.8}
          >
            <View style={styles.gpsIconWrapper}>
              {gpsLoading ? (
                <ActivityIndicator size="small" color="#0095F6" />
              ) : (
                <Text style={styles.gpsIcon}>📡</Text>
              )}
            </View>
            <Text style={styles.gpsText}>
              {gpsLoading ? 'Acquiring GPS location...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>

          {/* Places Autocomplete List */}
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>
              {query.trim().length > 0 ? 'Search Results' : 'Suggestions'}
            </Text>

            {loading && results.length === 0 ? (
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  !loading ? (
                    <View style={styles.emptyView}>
                      <Text style={styles.emptyText}>No locations found.</Text>
                    </View>
                  ) : null
                }
              />
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 15, 0.98)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  placeholderHeaderBtn: {
    width: 36,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
    marginTop: 15,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
  },
  gpsIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gpsIcon: {
    fontSize: 18,
  },
  gpsText: {
    color: '#0095F6',
    fontWeight: '700',
    fontSize: 15,
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingLeft: 4,
  },
  listContent: {
    paddingBottom: 30,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  pinWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pinIcon: {
    fontSize: 16,
  },
  textWrapper: {
    flex: 1,
  },
  placeName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  fullAddress: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingSpinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyView: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 14,
    fontWeight: '600',
  },
});
