import { StyleSheet, Platform } from 'react-native';
import {
  FAB_SIZE,
  FAB_MARGIN,
  FAB_BORDER_RADIUS,
  FAB_ELEVATION,
  FAB_Z_INDEX,
  MENU_ITEM_HEIGHT,
  MENU_ITEM_SPACING,
  MENU_MAX_WIDTH,
} from '../../constants/quick-actions/quickActions.constants';

export default function createStyles(primaryColor = '#0a84ff') {
  return StyleSheet.create({
    fabContainer: {
      position: 'absolute',
      // Align to design spec: fixed bottom-right position
      bottom: 50,
      right: FAB_MARGIN,
      // Ensure FAB floats above backdrop and menu
      zIndex: FAB_Z_INDEX + 2,
      elevation: FAB_ELEVATION + 2,
    },
    fab: {
      width: FAB_SIZE,
      height: FAB_SIZE,
      borderRadius: FAB_BORDER_RADIUS,
      backgroundColor: primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: FAB_ELEVATION,
    },
    menuContainer: {
      position: 'absolute',
      // Anchor the menu to the FAB's right edge so it expands vertically above it.
      right: FAB_MARGIN,
      bottom: FAB_MARGIN  + MENU_ITEM_SPACING,
      maxWidth: MENU_MAX_WIDTH,
      alignItems: 'flex-end',
      // Menu should be above the backdrop but below the FAB (so FAB remains on top)
      zIndex: FAB_Z_INDEX + 1,
      elevation: FAB_ELEVATION + 1,
    },
    menuItemWrapper: {
      height: MENU_ITEM_HEIGHT,
      marginBottom: MENU_ITEM_SPACING,
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuItemButton: {
      flex: 1,
      height: MENU_ITEM_HEIGHT,
      borderRadius: MENU_ITEM_HEIGHT / 2,
      // Solid opaque background for high contrast over backdrop
      backgroundColor: '#ffffff',
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.04)',
      elevation: Platform.OS === 'android' ? FAB_ELEVATION : 0,
    },
    menuItemLabel: {
      fontSize: 16,
      color: '#111',
      paddingLeft: 12,
    },
  });
}
