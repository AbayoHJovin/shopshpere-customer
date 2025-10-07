import { API_ENDPOINTS, publicApiCall } from "@/lib/api";

interface LocationData {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
}

interface DeliveryStatus {
  available: boolean;
  country: string;
  countryCode: string;
  message: string;
}

interface DeliveryApiResponse {
  available: boolean;
  country: string;
  warehouseCount: number;
  message: string;
}

class LocationService {
  private static instance: LocationService;
  private cachedLocation: LocationData | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get user's location using multiple fallback methods
   */
  async getUserLocation(): Promise<LocationData> {
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    try {
      // Method 1: Try IP-based geolocation API
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        this.cachedLocation = {
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || 'XX',
          city: data.city,
          region: data.region
        };
        return this.cachedLocation;
      }
    } catch (error) {
      console.warn('IP geolocation failed, trying fallback:', error);
    }

    try {
      // Method 2: Fallback to another IP service
      const response = await fetch('https://api.country.is/');
      if (response.ok) {
        const data = await response.json();
        this.cachedLocation = {
          country: data.country || 'Unknown',
          countryCode: data.country || 'XX',
        };
        return this.cachedLocation;
      }
    } catch (error) {
      console.warn('Fallback geolocation failed:', error);
    }

    // Method 3: Use browser's built-in geolocation (requires user permission)
    try {
      const position = await this.getBrowserLocation();
      const locationData = await this.reverseGeocode(position.coords.latitude, position.coords.longitude);
      this.cachedLocation = locationData;
      return locationData;
    } catch (error) {
      console.warn('Browser geolocation failed:', error);
    }

    // Default fallback
    this.cachedLocation = {
      country: 'Unknown',
      countryCode: 'XX'
    };
    return this.cachedLocation;
  }

  /**
   * Get browser geolocation
   */
  private getBrowserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }

  /**
   * Reverse geocode coordinates to get country
   */
  private async reverseGeocode(lat: number, lng: number): Promise<LocationData> {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.countryName || 'Unknown',
          countryCode: data.countryCode || 'XX',
          city: data.city,
          region: data.principalSubdivision
        };
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }

    return {
      country: 'Unknown',
      countryCode: 'XX'
    };
  }

  /**
   * Check delivery availability for user's location
   */
  async checkDeliveryAvailability(): Promise<DeliveryStatus> {
    try {
      const location = await this.getUserLocation();
      
      // Call backend API to check warehouse availability using the API configuration
      const apiUrl = API_ENDPOINTS.DELIVERY_CHECK_AVAILABILITY(location.country);
      const data = await publicApiCall<DeliveryApiResponse>(apiUrl);
      
      return {
        available: data.available,
        country: location.country,
        countryCode: location.countryCode,
        message: data.message
      };
      
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      
      // Fallback to location data even if API call fails
      try {
        const location = await this.getUserLocation();
        return {
          available: false,
          country: location.country,
          countryCode: location.countryCode,
          message: 'Unable to check delivery availability at this time'
        };
      } catch (locationError) {
        console.error('Error getting location:', locationError);
        return {
          available: false,
          country: 'Unknown',
          countryCode: 'XX',
          message: 'Location and delivery status unavailable'
        };
      }
    }
  }

  /**
   * Check delivery availability for a specific country
   */
  async checkDeliveryForCountry(country: string): Promise<DeliveryStatus> {
    try {
      const apiUrl = API_ENDPOINTS.DELIVERY_CHECK_AVAILABILITY(country);
      const data = await publicApiCall<DeliveryApiResponse>(apiUrl);
      
      return {
        available: data.available,
        country: country,
        countryCode: 'XX', // We don't have country code mapping for manual selection
        message: data.message
      };
      
    } catch (error) {
      console.error('Error checking delivery for country:', country, error);
      return {
        available: false,
        country: country,
        countryCode: 'XX',
        message: 'Unable to check delivery availability for this country'
      };
    }
  }

  /**
   * Get list of all countries where delivery is available
   */
  async getAvailableCountries(): Promise<string[]> {
    try {
      const data = await publicApiCall<{ countries: string[]; totalCountries: number; message: string }>(
        API_ENDPOINTS.DELIVERY_AVAILABLE_COUNTRIES
      );
      return data.countries || [];
    } catch (error) {
      console.error('Error fetching available countries:', error);
      return [];
    }
  }

  /**
   * Clear cached location (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cachedLocation = null;
  }
}

export const locationService = LocationService.getInstance();
export type { LocationData, DeliveryStatus };
