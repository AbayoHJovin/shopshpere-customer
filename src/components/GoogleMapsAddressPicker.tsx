"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Loader2, Navigation, Check } from "lucide-react";
import { toast } from "sonner";

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface AddressDetails {
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface GoogleMapsAddressPickerProps {
  onAddressSelect: (address: AddressDetails) => void;
  apiKey: string;
  initialLocation?: { lat: number; lng: number };
}

export function GoogleMapsAddressPicker({
  onAddressSelect,
  apiKey,
  initialLocation,
}: GoogleMapsAddressPickerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const geocoderInstance = useRef<any>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);
  const roadOverlayRef = useRef<any>(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  // Initialize map when loaded
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance.current) {
      initializeMap();
    }
  }, [isLoaded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (
        searchInputRef.current?.contains(target) ||
        suggestionContainerRef.current?.contains(target)
      ) {
        return;
      }
      
      setShowSuggestions(false);
      setPopoverOpen(false);
      setInputFocused(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current) {
      console.error("Google Maps not loaded or map container not available");
      return;
    }

    try {
      // Default to user's location or provided initial location
      const defaultLocation = initialLocation || { lat: -1.9441, lng: 30.0619 }; // Kigali, Rwanda

      // Initialize map with error handling
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.HYBRID, // Use hybrid to show both roads and satellite
        mapTypeControl: true, // Enable map type controls so users can switch
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_CENTER,
          mapTypeIds: [
            window.google.maps.MapTypeId.ROADMAP,
            window.google.maps.MapTypeId.SATELLITE,
            window.google.maps.MapTypeId.HYBRID,
            window.google.maps.MapTypeId.TERRAIN
          ]
        },
        streetViewControl: true, // Enable street view for better navigation
        streetViewControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        fullscreenControl: true, // Enable fullscreen for better viewing
        fullscreenControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        },
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        },
        styles: [
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [
              { color: "#3b82f6" }, // Blue color for roads
              { weight: 3 },
              { visibility: "on" }
            ]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [
              { color: "#2563eb" }, // Darker blue for highways
              { weight: 5 },
              { visibility: "on" }
            ]
          },
          {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [
              { color: "#3b82f6" }, // Blue for arterial roads
              { weight: 4 },
              { visibility: "on" }
            ]
          },
          {
            featureType: "road.local",
            elementType: "geometry",
            stylers: [
              { color: "#60a5fa" }, // Lighter blue for local roads
              { weight: 2.5 },
              { visibility: "on" }
            ]
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [
              { color: "#ffffff" },
              { visibility: "on" }
            ]
          },
          {
            featureType: "road",
            elementType: "labels.text.stroke",
            stylers: [
              { color: "#1e40af" },
              { weight: 2 },
              { visibility: "on" }
            ]
          }
        ]
      });

      // Initialize geocoder
      geocoderInstance.current = new window.google.maps.Geocoder();
      
      // Initialize autocomplete service for search suggestions
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(mapInstance.current);

      // Initialize marker with custom styling for better visibility on satellite view
      
      markerInstance.current = new window.google.maps.Marker({
        position: defaultLocation,
        map: mapInstance.current,
        draggable: true,
        title: "Selected Delivery Location - Drag to adjust",
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#FF4444" stroke="#FFFFFF" stroke-width="3"/>
              <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
              <circle cx="20" cy="20" r="4" fill="#FF4444"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        },
        animation: window.google.maps.Animation.DROP
      });

      console.log("Google Maps initialized successfully");
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      toast.error("Failed to initialize map. Please refresh the page and try again.");
      return;
    }

    // Add click listener to map
    mapInstance.current.addListener("click", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Move marker to clicked position
      markerInstance.current.setPosition({ lat, lng });
      
      // Reverse geocode to get address
      reverseGeocode(lat, lng);
    });

    // Add drag listener to marker
    markerInstance.current.addListener("dragend", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Reverse geocode to get address
      reverseGeocode(lat, lng);
    });

    // Try to get user's current location
    getCurrentLocation();
  }, [initialLocation]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Update map center and marker position
        if (mapInstance.current && markerInstance.current) {
          const location = { lat, lng };
          mapInstance.current.setCenter(location);
          mapInstance.current.setZoom(18); // Zoom in closer for current location
          markerInstance.current.setPosition(location);
          
          // Add a bounce animation to highlight the current location
          markerInstance.current.setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => {
            if (markerInstance.current) {
              markerInstance.current.setAnimation(null);
            }
          }, 2000);
          
          // Reverse geocode to get address
          reverseGeocode(lat, lng);
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to get your current location");
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoderInstance.current) return;

    geocoderInstance.current.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        if (status === "OK" && results[0]) {
          const addressDetails = parseGoogleAddressComponents(results[0], lat, lng);
          setSelectedAddress(addressDetails);
          setSearchValue(addressDetails.formattedAddress);
        } else {
          toast.error("Unable to get address for this location");
        }
      }
    );
  };

  const parseGoogleAddressComponents = (result: any, lat: number, lng: number): AddressDetails => {
    const components = result.address_components;
    let streetNumber = "";
    let streetName = "";
    let city = "";
    let state = "";
    let country = "";

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (types.includes("route")) {
        streetName = component.long_name;
      } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      } else if (types.includes("country")) {
        country = component.long_name;
      }
    });

    return {
      streetNumber,
      streetName,
      city,
      state,
      country,
      latitude: lat,
      longitude: lng,
      formattedAddress: result.formatted_address,
    };
  };

  const parseGooglePlaceDetails = (place: any, lat: number, lng: number): AddressDetails => {
    const components = place.address_components || [];
    let streetNumber = "";
    let streetName = "";
    let city = "";
    let state = "";
    let country = "";

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (types.includes("route")) {
        streetName = component.long_name;
      } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      } else if (types.includes("country")) {
        country = component.long_name;
      }
    });

    return {
      streetNumber,
      streetName,
      city,
      state,
      country,
      latitude: lat,
      longitude: lng,
      formattedAddress: place.formatted_address || place.name,
    };
  };

  // Handle search input changes and fetch suggestions
  const handleSearchInputChange = (value: string) => {
    setSearchValue(value);
    
    if (value.length > 2 && autocompleteService.current) {
      setIsSearching(true);
      
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: [] } // Allow all countries
        },
        (predictions: any[], status: string) => {
          setIsSearching(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            console.log("Got predictions:", predictions);
            setSearchSuggestions(predictions);
            setShowSuggestions(true);
            // Only open popover if input is focused
            if (inputFocused) {
              setPopoverOpen(true);
            }
          } else {
            console.log("No predictions:", status);
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setPopoverOpen(false);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    console.log("Suggestion selected:", suggestion);
    
    setSearchValue(suggestion.description);
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setPopoverOpen(false);
    
    // Keep focus on input after selection
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
    
    // Show loading state
    setIsLoadingLocation(true);
    
    if (!placesService.current) {
      console.error("Places service not available");
      toast.error("Maps service not available. Please try again.");
      setIsLoadingLocation(false);
      return;
    }

    if (!mapInstance.current || !markerInstance.current) {
      console.error("Map or marker not initialized");
      toast.error("Map not ready. Please wait a moment and try again.");
      setIsLoadingLocation(false);
      return;
    }
    
    console.log("Getting place details for:", suggestion.place_id);
    
    placesService.current.getDetails(
      { 
        placeId: suggestion.place_id,
        fields: ['geometry', 'address_components', 'formatted_address', 'name', 'types']
      },
      (place: any, status: string) => {
        console.log("Place details response:", { place, status });
        setIsLoadingLocation(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          try {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            console.log("Navigating to coordinates:", { lat, lng });
            
            // Immediately update map center and marker position
            if (mapInstance.current && markerInstance.current) {
              const location = { lat, lng };
              
              // Use multiple methods to ensure navigation works
              try {
                // Method 1: Set center immediately
                mapInstance.current.setCenter(location);
                
                // Method 2: Also use panTo for smooth animation
                mapInstance.current.panTo(location);
                
                // Set appropriate zoom level based on place type
                const zoomLevel = getZoomLevelForPlace(suggestion, place);
                console.log("Setting zoom level:", zoomLevel);
                
                // Set zoom with a small delay to ensure center is set first
                setTimeout(() => {
                  if (mapInstance.current) {
                    mapInstance.current.setZoom(zoomLevel);
                  }
                }, 100);
                
                // Update marker position immediately
                markerInstance.current.setPosition(location);
                
                // Add bounce animation for visual feedback
                markerInstance.current.setAnimation(window.google.maps.Animation.BOUNCE);
                setTimeout(() => {
                  if (markerInstance.current) {
                    markerInstance.current.setAnimation(null);
                  }
                }, 1500);
                
                // Show success feedback
                const locationName = place.name || suggestion.structured_formatting?.main_text || 'selected location';
                console.log("Navigation successful to:", locationName);
                toast.success(`📍 Navigated to ${locationName}`);
                
                // Force a map refresh to ensure the view updates
                setTimeout(() => {
                  if (mapInstance.current) {
                    window.google.maps.event.trigger(mapInstance.current, 'resize');
                  }
                }, 200);
                
              } catch (navError) {
                console.error("Navigation error:", navError);
                toast.error("Navigation failed. Please try clicking the suggestion again.");
              }
            } else {
              console.error("Map or marker instance not available during navigation");
              toast.error("Map navigation failed. Please try again.");
            }
            
            // Parse address from place details
            const addressDetails = parseGooglePlaceDetails(place, lat, lng);
            setSelectedAddress(addressDetails);
            
          } catch (error) {
            console.error("Error processing place details:", error);
            toast.error("Error processing location. Please try selecting again.");
          }
        } else {
          // Handle different status codes
          let errorMessage = "Could not get details for selected location.";
          
          switch (status) {
            case window.google.maps.places.PlacesServiceStatus.NOT_FOUND:
              errorMessage = "Location not found. Please try a different search.";
              break;
            case window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
              errorMessage = "No details available for this location.";
              break;
            case window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
              errorMessage = "Too many requests. Please wait a moment and try again.";
              break;
            case window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
              errorMessage = "Request denied. Please check your API key permissions.";
              break;
            default:
              errorMessage = `Location service error: ${status}`;
          }
          
          console.error("Places service error:", { status, place, suggestion });
          toast.error(errorMessage);
        }
      }
    );
  };

  // Helper function to determine appropriate zoom level based on place type
  const getZoomLevelForPlace = (suggestion: any, place: any): number => {
    const types = place.types || suggestion.types || [];
    
    // Country level
    if (types.includes('country')) return 6;
    
    // State/Province level
    if (types.includes('administrative_area_level_1')) return 8;
    
    // City level
    if (types.includes('locality') || types.includes('administrative_area_level_2')) return 12;
    
    // Neighborhood level
    if (types.includes('sublocality') || types.includes('neighborhood')) return 15;
    
    // Street/establishment level
    if (types.includes('establishment') || types.includes('point_of_interest') || types.includes('premise')) return 18;
    
    // Default zoom for addresses
    return 17;
  };

  const handleSearch = () => {
    if (!searchValue.trim() || !geocoderInstance.current) return;

    geocoderInstance.current.geocode(
      { address: searchValue },
      (results: any[], status: string) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          // Update map center and marker position
          if (mapInstance.current && markerInstance.current) {
            mapInstance.current.setCenter({ lat, lng });
            mapInstance.current.setZoom(17);
            markerInstance.current.setPosition({ lat, lng });
          }
          
          const addressDetails = parseGoogleAddressComponents(results[0], lat, lng);
          setSelectedAddress(addressDetails);
        } else {
          toast.error("Address not found. Please try a different search term.");
        }
      }
    );
  };

  const handleConfirmAddress = () => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
      toast.success("Address selected successfully!");
    } else {
      toast.error("Please select a location on the map first");
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading Google Maps...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Delivery Address
        </CardTitle>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
            <span className="inline-block w-4 h-1 bg-blue-600 rounded"></span>
            Blue highlighted paths show roads where delivery is available
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Click on or near the blue roads to select your pickup location
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Box with Custom Dropdown */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="relative">
              <Input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search for an address, landmark, or area..."
                className="w-full pr-8"
                onFocus={() => {
                  setInputFocused(true);
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={(e) => {
                  // Only blur if not clicking on suggestions
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (!suggestionContainerRef.current?.contains(relatedTarget)) {
                    setTimeout(() => {
                      setInputFocused(false);
                      setShowSuggestions(false);
                    }, 150);
                  }
                }}
              />
              {isSearching && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Custom Suggestions Dropdown */}
            {showSuggestions && (searchSuggestions.length > 0 || isSearching) && (
              <div 
                ref={suggestionContainerRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <div className="py-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Suggestions
                    </div>
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        onClick={() => {
                          console.log("Suggestion clicked:", suggestion.structured_formatting?.main_text);
                          handleSuggestionSelect(suggestion);
                        }}
                        className="w-full text-left px-3 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                        onMouseDown={(e) => {
                          // Prevent input blur when clicking suggestion
                          e.preventDefault();
                        }}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {suggestion.structured_formatting?.main_text || suggestion.description}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {suggestion.structured_formatting?.secondary_text || suggestion.description}
                            </p>
                            {suggestion.types && suggestion.types.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {suggestion.types.slice(0, 2).map((type: string, idx: number) => (
                                  <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {type.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Click to navigate
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchValue.length > 2 ? (
                  <div className="flex items-center gap-3 py-6 px-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">No locations found for "{searchValue}"</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <Button onClick={handleSearch} variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            onClick={getCurrentLocation} 
            variant="outline" 
            size="icon"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-[500px] rounded-md border shadow-lg"
            style={{ minHeight: "500px" }}
          />
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-md p-3 text-sm text-muted-foreground shadow-md border">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-medium">🛰️ Satellite View Active</span>
            </div>
            <div className="mt-1 text-xs">
              {isLoadingLocation ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Navigating to location...</span>
                </div>
              ) : (
                "Click anywhere on the map or drag the marker to select your delivery location"
              )}
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-md p-2.5 text-xs shadow-md border border-blue-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <span className="inline-block w-3 h-0.5 bg-blue-600 rounded"></span>
                <span>Blue paths = Delivery available roads</span>
              </div>
              <div className="text-muted-foreground">
                🗺️ Use map controls to switch between Satellite, Roadmap, Hybrid, and Terrain views
              </div>
            </div>
          </div>
        </div>

        {/* Selected Address Info - Compact display below map */}
        {selectedAddress && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 mb-1">Location Selected</p>
                <p className="text-xs text-green-700 truncate">
                  {selectedAddress.formattedAddress}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <Button 
          onClick={handleConfirmAddress} 
          className="w-full" 
          disabled={!selectedAddress}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Use This Address
        </Button>
      </CardContent>
    </Card>
  );
}
