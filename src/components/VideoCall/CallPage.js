import React from 'react';
import { View, StyleSheet } from 'react-native';
// !mark
import {ZegoUIKitPrebuiltCall, ONE_ON_ONE_VIDEO_CALL_CONFIG } from '@zegocloud/zego-uikit-prebuilt-call-rn'
export default function VoiceCallPage(props) {
    // console.log("props", props.route.params.meetingId)
    const userID = String(Math.floor(Math.random() * 1000000)); // This should be a unique identifier for the user, such as a phone number or user ID from your system.
    console.log("userID", userID)
    const callID = props.route.params?.meetingId || "callID"; // This should be a unique identifier for the call, such as a meeting ID from your system.
    console.log("callID", callID)
    return (
        <View style={styles.container}>
{/* // !mark(1:14) */}
            <ZegoUIKitPrebuiltCall
                appID={1597212656}
                appSign={"bb62af9f823e40e8dbd243bd0d610a117d68c4447ff12463a926c7fbe0347a5a"}
                userID={userID} // userID can be something like a phone number or the user id on your own user system. 
                userName={"user" + userID}
                callID={callID} // callID can be any unique string. 

                config={{
                    // You can also use ONE_ON_ONE_VOICE_CALL_CONFIG/GROUP_VIDEO_CALL_CONFIG/GROUP_VOICE_CALL_CONFIG to make more types of calls.
                    ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
                    onCallEnd: (callID, reason, duration) => {
                        // If you're using React Navigation 6, use the navigate method instead of popTo.
                        props.navigation.navigate('Home')
                    },
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 0,
  },
});