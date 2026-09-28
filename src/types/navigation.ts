import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  BiometricAuth: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; otp?: string } | undefined;
};

export type DashboardStackParamList = {
  Home: undefined;
};

export type EcommerceStackParamList = {
  ProductList: undefined;
  CategoryList: undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderList: undefined;
  OrderSuccess: { orderId: string } | undefined;
};

// Keep CommerceStackParamList for backwards compatibility
export type CommerceStackParamList = EcommerceStackParamList;

export type StoryStackParamList = {
  StoryList: undefined;
  Camera: undefined;
  EditStory: {
    image: { uri: string; width: number; height: number };
    existingStoryId?: string;
    filter?: string;
  };
  CollageEditor: { images: Array<{ id: string; uri: string }> };
};

// Keep StoriesStackParamList for backwards compatibility
export type StoriesStackParamList = StoryStackParamList;

export type ProfileStackParamList = {
  Profile: undefined;
};

export type ProductivityStackParamList = {
  CreateNoteScreen: undefined;
  CreateExpenseScreen: undefined;
  CreateLeadScreen: undefined;
  CreateTaskScreen: undefined;
};

export type CommunicationStackParamList = {
  ChatList: undefined;
  ChatScreen: {
    conversationId: string;
    participantName?: string;
    participantId?: string;
  };
};

export type CallsStackParamList = {
  ZegoVideoCall: undefined;
  CallingScreen: undefined;
  VoiceCall: { meetingId?: string } | undefined;
  IncomingCall: undefined;
  OutgoingCall: undefined;
  VideoCall: undefined;
};

// Keep CallStackParamList for backwards compatibility
export type CallStackParamList = CallsStackParamList;

export type POCStackParamList = {
  FabPreview: undefined;
  BottomSheetUXScreen: undefined;
};

export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Ecommerce: NavigatorScreenParams<EcommerceStackParamList>;
  Story: NavigatorScreenParams<StoryStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  OnlineUsers: undefined;
  Commerce: NavigatorScreenParams<EcommerceStackParamList>;
  Stories: NavigatorScreenParams<StoryStackParamList>;
  Productivity: NavigatorScreenParams<ProductivityStackParamList>;
  Communication: NavigatorScreenParams<CommunicationStackParamList>;
  Calls: NavigatorScreenParams<CallsStackParamList>;
  POCs: NavigatorScreenParams<POCStackParamList>;
};

export type RootStackParamList = AuthStackParamList & {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Home: undefined;
  Profile: undefined;
  Commerce: NavigatorScreenParams<EcommerceStackParamList>;
  Stories: NavigatorScreenParams<StoryStackParamList>;
  Productivity: NavigatorScreenParams<ProductivityStackParamList>;
  Communication: NavigatorScreenParams<CommunicationStackParamList>;
  Calls: NavigatorScreenParams<CallsStackParamList>;
  POCs: NavigatorScreenParams<POCStackParamList>;
  OnlineUsers: undefined;
  VoiceCall: {meetingId?: string} | undefined;
  ZegoVideoCall: undefined;
  ZegoUIKitPrebuiltCallWaitingScreen: undefined;
  ZegoUIKitPrebuiltCallInCallScreen: undefined;
  CallingScreen: undefined;
  CreateNoteScreen: undefined;
  CreateExpenseScreen: undefined;
  CreateLeadScreen: undefined;
  CreateTaskScreen: undefined;
  ProductList: undefined;
  CategoryList: undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderList: undefined;
  OrderSuccess: { orderId: string } | undefined;
  Camera: undefined;
  EditStory: {
    image: { uri: string; width: number; height: number };
    existingStoryId?: string;
    filter?: string;
  };
  CollageEditor: {
    images: Array<{ id: string; uri: string }>;
  };
  StoryList: undefined;
  FabPreview: undefined;
  BottomSheetUXScreen: undefined;
  IncomingCall: undefined;
  OutgoingCall: undefined;
  VideoCall: undefined;
  ChatList: undefined;
  ChatScreen: { conversationId: string; participantName?: string; participantId?: string };
};


