"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import {
  addressService,
  AddressSuggestion,
} from "@/lib/services/address-service";
import { toast } from "sonner";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: any) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export function AddressInput({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter your address",
  label = "Address",
  required = false,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    country?: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value.length > 3) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        searchAddress(value);
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (query.length < 3) return;

    setIsLoading(true);
    try {
      const results = await addressService.searchAddress(query);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error searching address:", error);
      toast.error("Failed to search address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
    const addressComponents = addressService.parseAddressComponents(suggestion);

    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);

    if (onAddressSelect) {
      onAddressSelect(addressComponents);
    }

    await validateCountry(addressComponents.country);
  };

  const validateCountry = async (country: string) => {
    if (!country) return;

    setIsValidating(true);
    try {
      const isValid = await addressService.validateCountry(country);
      setValidationResult({ isValid, country });

      if (!isValid) {
        toast.error(
          `We don't deliver to ${country}. Please choose a different address.`
        );
      }
    } catch (error) {
      console.error("Error validating country:", error);
      toast.error("Failed to validate delivery address");
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="address">
        {label}
        {required && " *"}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`pr-10 ${
            validationResult && !validationResult.isValid
              ? "border-red-500 focus:border-red-500"
              : validationResult && validationResult.isValid
              ? "border-green-500 focus:border-green-500"
              : ""
          }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {isValidating && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
          {validationResult && !validationResult.isValid && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          {validationResult && validationResult.isValid && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {validationResult && !validationResult.isValid && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-[2px]">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">
            We don't deliver to {validationResult.country}. Please choose a
            different address.
          </span>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[2px] shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.display_name}
                  </p>
                  {suggestion.address && (
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.address.city && (
                        <span>{suggestion.address.city}</span>
                      )}
                      {suggestion.address.state && (
                        <span>, {suggestion.address.state}</span>
                      )}
                      {suggestion.address.country && (
                        <span>, {suggestion.address.country}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
