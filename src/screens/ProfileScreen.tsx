import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_DETAILS_KEY } from '../constants/api';
import { useLogout } from '../hooks/authHooks';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { RootStackParamList } from '../types/navigation';
import { User } from '../types/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const { logout, isLoading: logoutLoading } = useLogout();
  const {
    isBiometricAvailable: checkBiometricAvailable,
    isBiometricEnabled: checkBiometricEnabled,
    enableBiometric,
    disableBiometric,
  } = useBiometricAuth();

  // Load user details and check biometric preferences
  useEffect(() => {
    const initProfile = async () => {
      try {
        // Fetch user info
        const userDetailsString = await AsyncStorage.getItem(USER_DETAILS_KEY);
        if (userDetailsString) {
          setUserDetails(JSON.parse(userDetailsString));
        }

        // Fetch biometric status
        const avail = await checkBiometricAvailable();
        setBiometricAvailable(avail.available);

        if (avail.available) {
          const pref = await checkBiometricEnabled();
          setBiometricEnabled(!!pref);
        }
      } catch (error) {
        console.error('[ProfileScreen] Init error:', error);
      }
    };

    initProfile();
  }, [checkBiometricAvailable, checkBiometricEnabled]);

  // Handle biometric toggle
  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        const result = await enableBiometric();
        if (result.success) {
          setBiometricEnabled(true);
        } else {
          setBiometricEnabled(false);
          Alert.alert('Error', result.errorMessage || 'Failed to enable biometric authentication');
        }
      } else {
        await disableBiometric();
        setBiometricEnabled(false);
      }
    } catch (error) {
      console.error('[ProfileScreen] Biometric toggle error:', error);
      setBiometricEnabled(!value); // revert
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[ProfileScreen] Logout error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* User Info Header Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userDetails?.name ? userDetails.name.charAt(0).toUpperCase() : '👤'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userDetails?.name || 'Loading Name...'}</Text>
          <Text style={styles.userEmail}>{userDetails?.email || 'Loading Email...'}</Text>
        </View>
      </View>

      {/* Settings Options List */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Security Settings</Text>

        {biometricAvailable && (
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Biometric Login</Text>
              <Text style={styles.rowSubtitle}>Use fingerprint or face recognition</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#d1d1d6', true: '#34c759' }}
              thumbColor={biometricEnabled ? '#fff' : '#fff'}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Navigation & Presence</Text>

        <TouchableOpacity
          style={styles.clickableRow}
          onPress={() => navigation.navigate('OnlineUsers')}
        >
          <View>
            <Text style={styles.rowTitle}>👥 Online Presence</Text>
            <Text style={styles.rowSubtitle}>See which users are active right now</Text>
          </View>
          <Text style={styles.arrow}>❯</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clickableRow}
          onPress={() => {
            navigation.navigate('Communication', {
              screen: 'ChatList',
            });
          }}
        >
          <View>
            <Text style={styles.rowTitle}>👥 Chat List</Text>
            <Text style={styles.rowSubtitle}>See all your chats</Text>
          </View>
          <Text style={styles.arrow}>❯</Text>
        </TouchableOpacity>
      </View>
      

      {/* Logout Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={logoutLoading}
          style={[styles.logoutButton, logoutLoading && styles.disabledButton]}
          onPress={handleLogout}
        >
          {logoutLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.logoutText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a84ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8e8e93',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 8,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  clickableRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#8e8e93',
  },
  arrow: {
    fontSize: 16,
    color: '#c7c7cc',
  },
  footer: {
    flex:1,
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
