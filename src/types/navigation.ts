export type AuthStackParamList = {
  BiometricAuth: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; otp?: string } | undefined;
};

export type RootStackParamList = AuthStackParamList & {
  Home: undefined;
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
};
