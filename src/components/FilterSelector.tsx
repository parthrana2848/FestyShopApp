import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { FILTERS, FilterType } from '../constants/filters';

interface FilterSelectorProps {
  selectedFilter: FilterType;
  onFilterSelect: (filter: FilterType) => void;
}

export const FilterSelector = ({ selectedFilter, onFilterSelect }: FilterSelectorProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterOption, selectedFilter === filter.id && styles.activeFilter]}
            onPress={() => onFilterSelect(filter.id)}
          >
            <Text style={[styles.filterText, selectedFilter === filter.id && styles.activeFilterText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 10,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingBottom: 70,
    paddingTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeFilter: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  filterText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'black',
  },
});
