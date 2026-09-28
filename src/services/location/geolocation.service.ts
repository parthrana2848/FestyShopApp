import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Coordinates } from '../../types/location.types';

/**
 * GeolocationService wraps native GPS coordinates retrieval using react-native-geolocation-service.
 * Adheres strictly to the requirement of getCurrentPosition ONLY and zero background tracking.
 */
export class GeolocationService {
  /**
   * Request location permissions on Android (both coarse and fine).
   */
  private static async requestAndroidPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const coarseGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'FeshShopApp needs location access to tag locations in your stories.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (coarseGranted === PermissionsAndroid.RESULTS.GRANTED) {
        // Also try fine location for precise tag names
        const fineGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return fineGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return false;
    } catch (err) {
      console.warn('[GeolocationService] Android permission request error:', err);
      return false;
    }
  }

  /**
   * Requests runtime authorization from the user for location access (cross-platform).
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      try {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        return auth === 'granted';
      } catch (err) {
        console.warn('[GeolocationService] iOS permission request error:', err);
        return false;
      }
    } else {
      return await this.requestAndroidPermissions();
    }
  }

  /**
   * Retrieves the current location coordinates of the device.
   * Utilizes the highly accurate GPS provider with custom timeout safeguards.
   */
  static getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }
}
