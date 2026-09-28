import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LegendList } from '@legendapp/list';

import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import SectionRenderer from '../components/home/SectionRenderer';
import { QuickActionsFAB } from '../components/quick-actions';
import { defaultQuickActions } from '../config/quick-actions/quickActions.config';
import { useQuickActionsNavigation } from '../navigation/helpers/quickActionsNavigation.helper';
import ZegoUIKitPrebuiltCallService, { ZegoMultiCertificate } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';

import { useLogout } from '../hooks/authHooks';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { useVideoCall } from '../modules/video-call/hooks/useVideoCall';
import { usePresence } from '../modules/video-call/hooks/usePresence';

import { useSectionsQuery } from '../hooks/useSections';

import { RootStackParamList } from '../types/navigation';

import { Section } from '../types/section';
import { useHideTabBarOnScroll } from '../hooks/useHideTabBarOnScroll';
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { USER_DETAILS_KEY } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Filter and sort sections
 */
const filterAndSortSections = (sections: Section[] = []): Section[] => {
  return sections
    .filter(section => section.isActive && section.status === 'published')
    .sort((a, b) => {
      /**
       * Sort by displayOrder ASC
       */
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }

      /**
       * Higher priority first
       */
      return b.priority - a.priority;
    });
};

/**
 * Empty state component
 */
const renderEmptyComponent = () => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No content available right now.</Text>
    </View>
  );
};

export default  function HomeScreen() {

  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [invitees, setInvitees] = useState<string[]>(['69e22b1d2b4408e90083a5e7']); // This should be a list of user IDs you want to invite to the call.
  const getInvitees = () => {
    
  }
  const generateMeetingId = () => { return String(Math.floor(Math.random() * 1000000)); } // This should be a unique identifier for the user, such as a phone number or user ID from your system.
  const navigation = useNavigation<NavigationProp>();
  const { resolveAndNavigate } = useQuickActionsNavigation();
  const { initiateCall , counterValue, callState} = useVideoCall();
  const { logout, isLoading: logoutLoading } = useLogout();
  const {
    isBiometricAvailable,
    isBiometricEnabled,
    loginWithBiometrics,
    enableBiometric,
    disableBiometric,
  } = useBiometricAuth();

  const onScroll = useHideTabBarOnScroll();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [randomId, setRandomId] = useState('');
  const [zegoInitialized, setZegoInitialized] = useState(false);
  const currentUserIdRef = useRef<string | null>(null);

  // =====================================================
  // ✅ Pagination States
  // =====================================================

  const PAGE_LIMIT = 10;

  const [page, setPage] = useState(1);

  const [sections, setSections] = useState<Section[]>([]);

  const [hasMore, setHasMore] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  /**
   * Prevent duplicate pagination calls
   */
  const [
    onEndReachedCalledDuringMomentum,
    setOnEndReachedCalledDuringMomentum,
  ] = useState(false);

  // =====================================================
  // ✅ Fetch Sections
  // =====================================================

  const {
    data,
    isLoading: sectionsLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useSectionsQuery({
    page,
    limit: PAGE_LIMIT,
  });

  // =====================================================
  // ✅ Update Local Sections
  // =====================================================

  useEffect(() => {
    if (!data?.data) {
      return;
    }

    /**
     * Process incoming sections
     */
    const processedSections = filterAndSortSections(data.data);

    /**
     * Replace first page
     */
    if (page === 1) {
      setSections(processedSections);
    } else {
      /**
       * Append paginated data
       */
      setSections(prev => {
        const combined = [...prev, ...processedSections];

        /**
         * Remove duplicates
         */
        return combined.filter(
          (item, index, self) =>
            index === self.findIndex(t => t._id === item._id),
        );
      });
    }

    /**
     * Check if more data exists
     */
    setHasMore(processedSections.length >= PAGE_LIMIT);

    /**
     * Stop loader
     */
    setLoadingMore(false);
  }, [data, page]);

  // =====================================================
  // ✅ Infinite Scroll Handler
  // =====================================================

  const handleLoadMore = useCallback(() => {
    /**
     * Prevent duplicate calls
     */
    if (
      loadingMore ||
      sectionsLoading ||
      !hasMore ||
      onEndReachedCalledDuringMomentum
    ) {
      return;
    }

    setOnEndReachedCalledDuringMomentum(true);

    setLoadingMore(true);

    setPage(prev => prev + 1);
  }, [hasMore, loadingMore, onEndReachedCalledDuringMomentum, sectionsLoading]);


  //Init USER1
  const onUserILogin1 = async () => {
    try {
      const userId = "69de260ec6b3e97bc389cd04";
      
      // Uninitialize if already initialized or switching users
      if (zegoInitialized || currentUserIdRef.current !== userId) {
        console.log('[Zego] Uninitializing previous session...');
        await ZegoUIKitPrebuiltCallService.uninit();
        setZegoInitialized(false);
        currentUserIdRef.current = null;
      }
      
      setInvitees(['69e22b1d2b4408e90083a5e7']);
      console.log('[Zego] Initializing for user:', userId);
      
      await ZegoUIKitPrebuiltCallService.init(
        1597212656,
        "bb62af9f823e40e8dbd243bd0d610a117d68c4447ff12463a926c7fbe0347a5a",
        userId,
        userId,
        [ZIM, ZPNs],
        {
          ringtoneConfig: {
            incomingCallFileName: 'zego_incoming.mp3',
            outgoingCallFileName: 'zego_outgoing.mp3',
          },
          androidNotificationConfig: {
            channelID: "ZegoUIKit",
            channelName: "ZegoUIKit",
          },
        });
      
      setZegoInitialized(true);
      currentUserIdRef.current = userId;
      console.log('[Zego] Initialization complete for:', userId);
    } catch (error) {
      console.error('[Zego] Initialization error:', error);
      setZegoInitialized(false);
      currentUserIdRef.current = null;
    }
  }

  const onUserILogin2 = async () => {
    try {
      const userId = "69e22b1d2b4408e90083a5e7";
      
      // Uninitialize if already initialized or switching users
      if (zegoInitialized || currentUserIdRef.current !== userId) {
        console.log('[Zego] Uninitializing previous session...');
        await ZegoUIKitPrebuiltCallService.uninit();
        setZegoInitialized(false);
        currentUserIdRef.current = null;
      }
      
      setInvitees(['69de260ec6b3e97bc389cd04']);
      console.log('[Zego] Initializing for user:', userId);
      
      await ZegoUIKitPrebuiltCallService.init(
        1597212656,
        "bb62af9f823e40e8dbd243bd0d610a117d68c4447ff12463a926c7fbe0347a5a",
        userId,
        userId,
        [ZIM, ZPNs],
        {
          ringtoneConfig: {
            incomingCallFileName: 'zego_incoming.mp3',
            outgoingCallFileName: 'zego_outgoing.mp3',
          },
          androidNotificationConfig: {
            channelID: "ZegoUIKit",
            channelName: "ZegoUIKit",
          },
        });
      
      setZegoInitialized(true);
      currentUserIdRef.current = userId;
      console.log('[Zego] Initialization complete for:', userId);
    } catch (error) {
      console.error('[Zego] Initialization error:', error);
      setZegoInitialized(false);
      currentUserIdRef.current = null;
    }
  }
  // =====================================================
  // ✅ Pull To Refresh
  // =====================================================

  const handleRefresh = async () => {
    try {
      setPage(1);

      setHasMore(true);

      await refetch();
    } catch (refreshError) {
      console.log('Refresh Error:', refreshError);
    }
  };

  // =====================================================
  // ✅ Logout
  // =====================================================

  const handleLogout = async () => {
    await logout();
  };

  // =====================================================
  // ✅ Render Section
  // =====================================================

  const renderSection = useCallback(({ item }: { item: Section }) => {
    return <SectionRenderer section={item} />;
  }, []);

 const fetchUserDetails = async  () => {
      try {
        const userDetailsString = await AsyncStorage.getItem(USER_DETAILS_KEY);
        console.log('Fetched user details from AsyncStorage:', userDetailsString);
        if (userDetailsString) {
          const userDetails: User = JSON.parse(userDetailsString);
          setUserDetails(userDetails);
        } else {
          setUserDetails(null);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUserDetails(null);
      }
    }

  useEffect(() => {
  
    fetchUserDetails();
  }, []);

  console.log('Current counter value:', counterValue);
  
  // =====================================================
  // ✅ Header Component
  // =====================================================

  const renderHeader = () => {
    return (
      <View style={styles.adminSection}>
        <View style={styles.buttonGroup}>
          <Text style={[styles.buttonText, styles.secondaryButtonText, { textAlign: 'center', marginBottom: 12 }]}>
            {`CallState: ${callState} - Counter Value: ${counterValue !== null ? counterValue : 'N/A'}`}
          </Text>
          
          <Text style={[styles.buttonText, styles.secondaryButtonText, { textAlign: 'center', marginBottom: 12 }]}>
            {`Logged in as: ${userDetails?.name || 'Unknown User'} (${userDetails?.email || 'No Email'})`}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ProductList')}
          >
            <Text style={styles.buttonText}>Manage Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('CategoryList')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Manage Categories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('FabPreview')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>FAB Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('BottomSheetUXScreen')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Bottom Sheet UX Demo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#34C759' }]}
            onPress={() => navigation.navigate('ZegoVideoCall')}
          >
            <Text style={styles.buttonText}>📹 Video Call Feature</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('OrderList')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              View Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={logoutLoading}
            style={[
              styles.button,
              styles.secondaryButton,
              logoutLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogout}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              {logoutLoading ? 'Signing out…' : 'Sign out'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Cleanup Zego on unmount
  useEffect(() => {
    return () => {
      if (zegoInitialized) {
        console.log('[Zego] Cleaning up on unmount');
        ZegoUIKitPrebuiltCallService.uninit()
      }
    };
  }, [zegoInitialized]);


  // =====================================================
  // ✅ Infinite Scroll Loader
  // =====================================================

  const renderListFooter = () => {
    /**
     * Show loader only
     * while loading next page
     */
    return (
      <>
        {loadingMore ? (
          <View style={styles.footerLoaderContainer}>
            <ActivityIndicator size="small" color="#0a84ff" />

            <Text style={styles.loadingText}>Loading more content...</Text>
          </View>
        ) : null}

        {/* Spacer so last item can scroll into the area beneath the tab bar */}
        <View style={{ height: 120 }} />
      </>
    );
  };

  // =====================================================
  // ✅ Initial Loading
  // =====================================================

  if (sectionsLoading && page === 1 && !isRefetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    );
  }

  // =====================================================
  // ✅ Error State
  // =====================================================

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error?.message || 'Failed to load home screen content'}
        </Text>

        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =====================================================
  // ✅ Main Screen
  // =====================================================

  return (
    <View style={styles.container}>
          
      <LegendList
        data={sections}
        onScroll={onScroll}
        renderItem={renderSection}
        keyExtractor={item => item._id}
        /**
         * Header
         */
        ListHeaderComponent={renderHeader}
        /**
         * Footer Loader
         */
        ListFooterComponent={renderListFooter}
        /**
         * Empty State
         */
        ListEmptyComponent={renderEmptyComponent}
        /**
         * Pull To Refresh
         */
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#0a84ff"
          />
        }
        /**
         * Infinite Scroll
         */
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          setOnEndReachedCalledDuringMomentum(false);
        }}
        /**
         * Legend List Performance
         */
        recycleItems
        estimatedItemSize={300}
        drawDistance={1000}
        /**
         * Styling
         */
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

/**
 * Online Users Button Component
 * Displays online user count and navigates to OnlineUsersScreen
 */
interface OnlineUsersButtonProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

function OnlineUsersButton({ navigation }: OnlineUsersButtonProps) {
  const { onlineCount, isConnected } = usePresence();

  const handlePress = useCallback(() => {
    navigation.navigate('OnlineUsers');
  }, [navigation]);

  return (
    <TouchableOpacity
      style={[styles.button, styles.secondaryButton]}
      onPress={handlePress}
      // disabled={!isConnected}
    >
      <Text style={[styles.buttonText, styles.secondaryButtonText]}>
        👥 Online Users 
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },

  listContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },

  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
  },

  errorText: {
    color: '#d9534f',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },

  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0a84ff',
    borderRadius: 8,
    marginBottom: 32,
  },

  retryText: {
    color: '#fff',
    fontWeight: '600',
  },

  adminSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },

  buttonGroup: {
    width: '100%',
    gap: 12,
  },

  button: {
    backgroundColor: '#0a84ff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },

  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0a84ff',
  },

  secondaryButtonText: {
    color: '#0a84ff',
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  footerLoaderContainer: {
    paddingVertical: 20,
    paddingBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
