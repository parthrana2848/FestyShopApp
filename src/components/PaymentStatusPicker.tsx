import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PaymentStatus } from '../types/order';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string; description: string }[] = [
  { value: 'PENDING', label: 'Pending', description: 'Payment to be collected later' },
  { value: 'PAID', label: 'Paid', description: 'Payment already received' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentStatusPickerProps {
  selectedStatus: PaymentStatus;
  onSelect: (status: PaymentStatus) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PaymentStatusPicker({ selectedStatus, onSelect }: PaymentStatusPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Payment Status</Text>

      <View style={styles.optionsContainer}>
        {PAYMENT_STATUS_OPTIONS.map((option) => {
          const isSelected = selectedStatus === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.75}
            >
              {/* Radio indicator */}
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>

              {/* Label + description */}
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>

              {/* Status badge */}
              {isSelected && (
                <View
                  style={[
                    styles.statusBadge,
                    option.value === 'PAID' ? styles.statusBadgePaid : styles.statusBadgePending,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{option.label.toUpperCase()}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  optionLabelSelected: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgePending: {
    backgroundColor: '#FFF3CD',
  },
  statusBadgePaid: {
    backgroundColor: '#D4EDDA',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
});

export default memo(PaymentStatusPicker);
