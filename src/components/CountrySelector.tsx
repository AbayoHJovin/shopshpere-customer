"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { addressService } from "@/lib/services/address-service";
import { toast } from "sonner";

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function CountrySelector({
  value,
  onChange,
  label = "Country",
  required = false,
  placeholder = "Select a country",
}: CountrySelectorProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setIsLoading(true);
      const response = await addressService.getWarehouseCountriesPaginated(
        page,
        50
      );
      setCountries(response.content);
      setHasMore(response.number < response.totalPages - 1);
    } catch (error) {
      console.error("Error loading countries:", error);
      toast.error("Failed to load available countries");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreCountries = async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const response = await addressService.getWarehouseCountriesPaginated(
        nextPage,
        50
      );
      setCountries((prev) => [...prev, ...response.content]);
      setPage(nextPage);
      setHasMore(nextPage < response.totalPages - 1);
    } catch (error) {
      console.error("Error loading more countries:", error);
      toast.error("Failed to load more countries");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="country">
        {label}
        {required && " *"}
      </Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger id="country" className="w-full">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{country}</span>
              </div>
            </SelectItem>
          ))}
          {hasMore && (
            <div className="px-2 py-1">
              <button
                onClick={loadMoreCountries}
                disabled={isLoading}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading more...
                  </div>
                ) : (
                  "Load more countries..."
                )}
              </button>
            </div>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Only countries where we have warehouses are shown
      </p>
    </div>
  );
}
