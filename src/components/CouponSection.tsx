import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Coupon } from '../types/cart';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const AVAILABLE_COUPONS: Coupon[] = [
  { code: 'SAVE100', amount: 100 },
  { code: 'SAVE500', amount: 500 },
  { code: 'SAVE1000', amount: 1000 },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CouponCardProps {
  coupon: Coupon;
  isSelected: boolean;
  onSelect: (coupon: Coupon) => void;
}

interface CouponSectionProps {
  selectedCoupon: Coupon | null;
  onApply: (coupon: Coupon) => void;
  onRemove: () => void;
}

// ---------------------------------------------------------------------------
// CouponCard — individual selectable coupon
// ---------------------------------------------------------------------------

const CouponCard = memo(function CouponCard({ coupon, isSelected, onSelect }: CouponCardProps) {
  const handlePress = useCallback(() => onSelect(coupon), [coupon, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.couponCard, isSelected && styles.couponCardSelected]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      {/* Top row: code + applied badge */}
      <View style={styles.couponTop}>
        <Text style={[styles.couponCode, isSelected && styles.couponCodeSelected]}>
          {coupon.code}
        </Text>
        {isSelected && (
          <View style={styles.appliedBadge}>
            <Text style={styles.appliedBadgeText}>Applied</Text>
          </View>
        )}
      </View>

      {/* Discount amount */}
      <Text style={[styles.couponAmount, isSelected && styles.couponAmountSelected]}>
        Save ${coupon.amount.toFixed(0)}
      </Text>

      {/* Selector indicator */}
      <View style={[styles.couponDot, isSelected && styles.couponDotSelected]} />
    </TouchableOpacity>
  );
});

// ---------------------------------------------------------------------------
// CouponSection
// ---------------------------------------------------------------------------

function CouponSection({ selectedCoupon, onApply, onRemove }: CouponSectionProps) {
  return (
    <View style={styles.container}>
      {/* Heading row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Apply Coupon</Text>
        {selectedCoupon && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton} activeOpacity={0.7}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Coupon cards */}
      <View style={styles.cardsRow}>
        {AVAILABLE_COUPONS.map((coupon) => (
          <CouponCard
            key={coupon.code}
            coupon={coupon}
            isSelected={selectedCoupon?.code === coupon.code}
            onSelect={onApply}
          />
        ))}
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
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFE5E5',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fafafa',
    position: 'relative',
  },
  couponCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  couponTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  couponCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  couponCodeSelected: {
    color: '#007AFF',
  },
  appliedBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  appliedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  couponAmount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  couponAmountSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  couponDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  couponDotSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
});

export default memo(CouponSection);
