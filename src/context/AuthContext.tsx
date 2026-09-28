import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useMutation,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  fetchCurrentUser,
  forgotPasswordRequest,
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  googleLoginRequest,
} from '../api/auth';
import { googleLogout } from '../services/googleAuthService';
import { registerUnauthorizedHandler, setAuthToken } from '../api/axios';
import { AUTH_TOKEN_KEY, USER_DETAILS_KEY } from '../constants/api';
import queryClient from '../queryClient';
import {
  AuthProviderProps,
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from '../types/auth';
import ZegoUIKitPrebuiltCallService, { ZegoMultiCertificate } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import { store } from '../store';
import { resetCallState } from '../modules/video-call/store/videoCallSlice';
import { callService } from '../modules/video-call/services/call.service';
import { socketService } from '../modules/video-call/services/socket.service';
import { callRecoveryService } from '../modules/video-call/services/callRecovery.service';
import InCallManager from 'react-native-incall-manager';

export type AsyncOperationState = {
  isLoading: boolean;
  isSuccess?: boolean;
  error: unknown | null;
};

export type AuthContextData = {
  user: User | null;
  token: string | null;
  initializing: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  currentUserQuery: UseQueryResult<User, unknown>;
  loginState: AsyncOperationState;
  registerState: AsyncOperationState;
  logoutState: AsyncOperationState;
  forgotPasswordState: AsyncOperationState;
  resetPasswordState: AsyncOperationState;
  googleLoginState: AsyncOperationState;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [zegoInitialized, setZegoInitialized] = useState(false);

  const clearAuth = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await queryClient.removeQueries({ queryKey: ['currentUser'] });
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clearAuth();
    });
  }, [clearAuth]);

  useEffect(() => {
    const hydrateToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          setAuthToken(storedToken);
        }
        // Note: do not perform biometric prompt here. Biometric restore should be
        // initiated explicitly (for example from a splash screen) so the user
        // sees a prompt when appropriate. Hydration only restores existing token.
      } finally {
        setInitializing(false);
      }
    };
    hydrateToken();
  }, []);

  const currentUserQuery = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: !!token,
  });

  useEffect(() => {
    const error = currentUserQuery.error as any;

    if (error?.response?.status === 401) {
      clearAuth();
    }
  }, [currentUserQuery.error, clearAuth]);

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async (data: AuthResponse) => {
      console.log("get acces tokej", data)
      if (!data?.data.accessToken) {
        console.warn('Login response missing token', data);
        return;
      }

      setAuthToken(data.data.accessToken);
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.data.accessToken);
      await AsyncStorage.setItem(USER_DETAILS_KEY, JSON.stringify(data.data.user));
      setToken(data.data.accessToken);

      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  //    const onUserLogin = async (userID : string, userName : string) => {
  //   return ZegoUIKitPrebuiltCallService.init(
  //     1597212656, // You can get it from ZEGOCLOUD's console
  //     "bb62af9f823e40e8dbd243bd0d610a117d68c4447ff12463a926c7fbe0347a5a", // You can get it from ZEGOCLOUD's console
  //     userID,
  //     userName,
  //     [ZIM, ZPNs],
  //     {
  //       ringtoneConfig: {
  //         incomingCallFileName: 'zego_incoming.mp3',
  //         outgoingCallFileName: 'zego_outgoing.mp3',
  //       },
  //       androidNotificationConfig: {
  //         channelID: "ZegoUIKit",
  //         channelName: "ZegoUIKit",
  //       },
  //     });
  // }

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: async (data: AuthResponse) => {
      // return
      if (!data?.data.accessToken) {
        console.warn('Registration response missing token', data);
        return;
      }

      setAuthToken(data.data.accessToken);
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.data.accessToken);
      setToken(data.data.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });


  const googleLoginMutation = useMutation({
    mutationFn: googleLoginRequest,
    onSuccess: async (data: AuthResponse) => {
      console.log("get acces tokej", data?.data?.user)
      if (!data?.data?.accessToken) {
        console.warn('Login response missing token', data);
        return;
      }

      setAuthToken(data.data.accessToken);
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data?.data?.accessToken);
      await AsyncStorage.setItem(USER_DETAILS_KEY, JSON.stringify(data?.data?.user));
      setToken(data?.data?.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('[Auth] Starting logout cleanup...');
      
      // 1. End any active video calls
      const videoCallState = store.getState().videoCall;
      if (videoCallState && videoCallState.callState !== 'idle') {
        console.log('[Auth] Ending active call before logout...');
        const remoteUserId = 
          videoCallState.receiver?.userId ?? 
          videoCallState.caller?.userId;
        
        if (remoteUserId) {
          try {
            callService.endCall(remoteUserId);
          } catch (e) {
            console.warn('[Auth] Error ending call:', e);
          }
        }
        
        // Cleanup call service and stop InCallManager
        callService.cleanup();
        try {
          InCallManager.stop();
        } catch (e) {
          console.warn('[Auth] Error stopping InCallManager:', e);
        }
      }
      
      // 2. Stop call recovery service (removes AppState and NetInfo listeners)
      try {
        callRecoveryService.stop();
        console.log('[Auth] Call recovery service stopped');
      } catch (e) {
        console.warn('[Auth] Error stopping recovery service:', e);
      }
      
      // 3. Disconnect custom WebRTC socket
      try {
        socketService.disconnect();
        console.log('[Auth] Socket disconnected');
      } catch (e) {
        console.warn('[Auth] Error disconnecting socket:', e);
      }
      
      // 4. Uninitialize Zego service if initialized
      // Check if Zego was initialized before trying to uninit
      try {
        // Zego might be initialized from HomeScreen or ZegoVideoCallScreen
        // Always attempt uninit on logout to ensure cleanup
        await ZegoUIKitPrebuiltCallService.uninit();
        console.log('[Auth] Zego service uninitialized');
      } catch (e) {
        // It's okay if uninit fails - might not have been initialized
        console.log('[Auth] Zego uninit skipped or failed:', e || e);
      }
      
      // 5. Sign out from Google if using Google auth
      try {
        await googleLogout();
        console.log('[Auth] Google logout successful');
      } catch (e) {
        console.warn('[Auth] Google logout error:', e);
      }
      
      console.log('[Auth] Logout cleanup complete');
      return Promise.resolve();
    },
    onSuccess: async () => {
      // Clear authentication data
      await clearAuth();
      
      // Clear all cached queries
      queryClient.clear();
      
      // Reset video call state in Redux
      store.dispatch(resetCallState());
      
      console.log('[Auth] Logout successful - all data cleared');
    },
    onError: async (error) => {
      console.error('[Auth] Logout mutation error:', error);
      
      // Even on error, ensure auth is cleared for security
      await clearAuth();
      
      // Try to reset call state even if other operations failed
      try {
        store.dispatch(resetCallState());
      } catch (e) {
        console.warn('[Auth] Error resetting call state:', e);
      }
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordRequest,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordRequest,
  });

  const login = useCallback(
    async (payload: LoginPayload) => {
      await loginMutation.mutateAsync(payload);
    },
    [loginMutation],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerMutation.mutateAsync(payload);
    },
    [registerMutation],
  );

  const googleLogin = useCallback(async (idToken: string) => {
    await googleLoginMutation.mutateAsync(idToken);
  }, [googleLoginMutation]);

  const loginWithBiometric = useCallback(async () => {
    try {
      // Attempt to read stored token and restore session. The biometric
      // authentication itself should be performed by the caller (hook/service)
      // prior to calling this function.
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        throw new Error('No stored token available for biometric login');
      }
      setAuthToken(storedToken);
      setToken(storedToken);
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      console.warn('Biometric restore failed', (error as Error).message);
      // Ensure there is no partial auth state
      setAuthToken(null);
      setToken(null);
      await queryClient.removeQueries({ queryKey: ['currentUser'] });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload) => {
      await forgotPasswordMutation.mutateAsync(payload);
    },
    [forgotPasswordMutation],
  );

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload) => {
      await resetPasswordMutation.mutateAsync(payload);
    },
    [resetPasswordMutation],
  );

  const refreshUser = useCallback(async () => {
    await currentUserQuery.refetch();
  }, [currentUserQuery]);

  const contextValue = useMemo(
    () => ({
      user: currentUserQuery.data ?? null,
      token,
      initializing,
      isAuthenticated: !!token,
      login,
      register,
      googleLogin,
      loginWithBiometric,
      logout,
      refreshUser,
      forgotPassword,
      resetPassword,
      currentUserQuery,
      loginState: {
        isLoading: loginMutation.isPending,
        isSuccess: loginMutation.isSuccess,
        error: loginMutation.error,
      },
      registerState: {
        isLoading: registerMutation.isPending,
        isSuccess: registerMutation.isSuccess,
        error: registerMutation.error,
      },
      logoutState: {
        isLoading: logoutMutation.isPending,
        error: logoutMutation.error,
      },
      forgotPasswordState: {
        isLoading: forgotPasswordMutation.isPending,
        isSuccess: forgotPasswordMutation.isSuccess,
        error: forgotPasswordMutation.error,
      },
      resetPasswordState: {
        isLoading: resetPasswordMutation.isPending,
        isSuccess: resetPasswordMutation.isSuccess,
        error: resetPasswordMutation.error,
      },
      googleLoginState: {
        isLoading: googleLoginMutation.isPending,
        isSuccess: googleLoginMutation.isSuccess,
        error: googleLoginMutation.error,
      },
    }),
    [
      currentUserQuery,
      initializing,
      login,
      loginMutation,
      logout,
      logoutMutation,
      register,
      registerMutation,
      refreshUser,
      token,
      forgotPassword,
      forgotPasswordMutation,
      resetPassword,
      resetPasswordMutation,
      googleLogin,
      googleLoginMutation,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
