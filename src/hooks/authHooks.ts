import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
  const { login, loginState } = useAuth();
  return {
    login,
    isLoading: loginState.isLoading,
    isSuccess: loginState.isSuccess,
    error: loginState.error,
  };
};

export const useGoogleLogin = () => {
  const { googleLogin, googleLoginState } = useAuth();
  return {
    googleLogin,
    isLoading: googleLoginState.isLoading,
    isSuccess: googleLoginState.isSuccess,
    error: googleLoginState.error,
  };
};

export const useRegister = () => {
  const { register, registerState } = useAuth();
  return {
    register,
    isLoading: registerState.isLoading,
    isSuccess: registerState.isSuccess,
    error: registerState.error,
  };
};

export const useLogout = () => {
  const { logout, logoutState } = useAuth();
  return {
    logout,
    isLoading: logoutState.isLoading,
    error: logoutState.error,
  };
};

export const useCurrentUser = () => {
  const { user, currentUserQuery, refreshUser, initializing } = useAuth();
  return {
    user,
    initializing,
    isLoading: currentUserQuery.isLoading,
    error: currentUserQuery.error,
    refreshUser,
  };
};

export const useForgotPassword = () => {
  const { forgotPassword, forgotPasswordState } = useAuth();
  return {
    forgotPassword,
    isLoading: forgotPasswordState.isLoading,
    isSuccess: forgotPasswordState.isSuccess,
    error: forgotPasswordState.error,
  };
};

export const useResetPassword = () => {
  const { resetPassword, resetPasswordState } = useAuth();
  return {
    resetPassword,
    isLoading: resetPasswordState.isLoading,
    isSuccess: resetPasswordState.isSuccess,
    error: resetPasswordState.error,
  };
};
