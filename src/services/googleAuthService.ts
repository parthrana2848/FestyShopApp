import {
    GoogleSignin,
} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';

GoogleSignin.configure({
    webClientId: Config.GOOGLE_WEB_CLIENT_ID,
});

export const signInWithGoogle =
    async () => {
        try {
            await GoogleSignin.hasPlayServices();

            const response =
                await GoogleSignin.signIn();

            return response;
        } catch (error) {
            throw error;
        }
    };

export const googleLogout = async () => {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error('Google Logout Error:', error);
    }
};