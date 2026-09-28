import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { RootStackParamList } from '../../types/navigation';
import { SectionItem } from '../../types/section';

interface SectionCardProps {
  item: SectionItem;
  width?: number;
  height?: number;
  borderRadius?: number;
  showTitle?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SectionCard: React.FC<SectionCardProps> = ({ 
  item, 
  width = 100, 
  height = 100, 
  borderRadius = 12,
  showTitle = true 
}) => {

  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    const { type, value } = item.cta;
    
    // Basic navigation routing based on CTA type
    if (type === 'category' && value) {
      // In a real app we might navigate to a specific category page
      // Here we can navigate to CategoryList or a hypothetical CategoryDetail
      navigation.navigate('CategoryList'); 
    } else if (type === 'product' && value) {
      navigation.navigate('ProductList');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { width }]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.image }} 
        style={[styles.image, { width, height, borderRadius }]} 
        resizeMode="cover"
      />
      {showTitle && item.title && (
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      )}
      {showTitle && item.subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginRight: 12,
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    width: '100%',
    marginTop: 2,
  },
});
