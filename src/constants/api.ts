// export const API_BASE_URL = 'http://10.10.10.55:3000';
// export const API_BASE_URL = 'http://192.168.3.70:3000';

import Config from 'react-native-config';
export const API_BASE_URL = Config.API_BASE_URL;
// export const API_BASE_URL = 'http://192.168.29.2:3000';
export const AUTH_TOKEN_KEY = '@FeshShopApp:auth_token';
export const USER_DETAILS_KEY = '@FeshShopApp:user_details';
export const PAYMENTS_CREATE_ORDER = '/api/v1/payments/create-order';
export const PAYMENTS_VERIFY = '/api/v1/payments/verify';
export const PENDING_PAYMENT_ORDER_KEY = '@FeshShopApp:pending_payment_order';
