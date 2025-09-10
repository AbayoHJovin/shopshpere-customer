import { API_BASE_URL } from "../api";

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  type: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface AddressValidationRequest {
  address: string;
}

export interface AddressValidationResponse {
  isValid: boolean;
  country?: string;
  suggestions?: AddressSuggestion[];
}

class AddressService {
  private baseUrl = `${API_BASE_URL}/warehouses`;

  async getWarehouseCountries(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/countries`);
    if (!response.ok) {
      throw new Error("Failed to fetch warehouse countries");
    }
    return response.json();
  }

  async getWarehouseCountriesPaginated(
    page: number = 0,
    size: number = 20
  ): Promise<{
    content: string[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const response = await fetch(
      `${this.baseUrl}/countries/paginated?page=${page}&size=${size}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch warehouse countries");
    }
    return response.json();
  }

  async validateCountry(country: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/countries/validate-country`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ country }),
    });
    if (!response.ok) {
      throw new Error("Failed to validate country");
    }
    return response.json();
  }

  async searchAddress(query: string): Promise<AddressSuggestion[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=10&addressdetails=1`
      );
      if (!response.ok) {
        throw new Error("Failed to search address");
      }
      return response.json();
    } catch (error) {
      console.error("Error searching address:", error);
      return [];
    }
  }

  parseAddressComponents(suggestion: AddressSuggestion) {
    const address = suggestion.address || {};
    return {
      streetAddress: `${address.house_number || ""} ${
        address.road || ""
      }`.trim(),
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postcode || "",
      country: address.country || "",
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lon: parseFloat(suggestion.lon),
      },
    };
  }
}

export const addressService = new AddressService();
