import { useState, useCallback, useRef } from 'react';
import { GeolocationService } from '../services/location/geolocation.service';
import { GeocodingService } from '../services/location/geocoding.service';
import { StoryLocation, LocationSearchResult } from '../types/location.types';

/**
 * useLocation is a highly optimized React hook designed to orchestrate geolocation
 * permissions, GPS one-shot queries, Nominatim reverse geocoding, and search autocompletes.
 * Memoizes callbacks to avoid unnecessary re-renders in calling screens.
 */
export const useLocation = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<StoryLocation | null>(null);

  // Keep track of ongoing operations to prevent overlapping states
  const activeFetchRef = useRef<boolean>(false);

  /**
   * One-click location finder. Request authorizations, fetch high-accuracy coords,
   * reverse geocode to resolve place name, and set the state.
   */
  const fetchCurrentLocation = useCallback(async (): Promise<StoryLocation | null> => {
    if (activeFetchRef.current) return null;
    activeFetchRef.current = true;
    
    setLoading(true);
    setError(null);

    try {
      const authorized = await GeolocationService.requestPermissions();
      if (!authorized) {
        throw new Error('Location permissions were denied by the user.');
      }

      const coordinates = await GeolocationService.getCurrentPosition();
      const placeName = await GeocodingService.reverseGeocode(coordinates);

      const resolvedLocation: StoryLocation = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        placeName,
      };

      setCurrentLocation(resolvedLocation);
      return resolvedLocation;
    } catch (err: any) {
      console.warn('[useLocation] Failed to acquire current GPS location:', err);
      const errMsg = err?.message || 'Unable to fetch current GPS coordinates.';
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
      activeFetchRef.current = false;
    }
  }, []);

  /**
   * Autocomplete location search queries.
   */
  const searchLocation = useCallback(async (query: string): Promise<LocationSearchResult[]> => {
    setLoading(true);
    setError(null);

    try {
      return await GeocodingService.searchLocations(query);
    } catch (err: any) {
      console.warn('[useLocation] Failed to execute location query:', err);
      setError(err?.message || 'Error occurred during location search.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    currentLocation,
    fetchCurrentLocation,
    searchLocation,
  };
};
