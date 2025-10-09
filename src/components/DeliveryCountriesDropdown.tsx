"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Search, MapPin, Truck, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { locationService } from "@/lib/services/locationService";

interface DeliveryCountriesDropdownProps {
  className?: string;
  currentCountry?: string;
  onCountrySelect?: (country: string) => void;
}

const ITEMS_PER_PAGE = 8;

export function DeliveryCountriesDropdown({ 
  className = "", 
  currentCountry,
  onCountrySelect 
}: DeliveryCountriesDropdownProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch available countries
  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const availableCountries = await locationService.getAvailableCountries();
      // Remove duplicates and sort alphabetically
      const uniqueCountries = [...new Set(availableCountries)].sort();
      setCountries(uniqueCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && countries.length === 0) {
      fetchCountries();
    }
  }, [isOpen, countries.length]);

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countries;
    return countries.filter(country =>
      country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [countries, searchTerm]);

  // Paginate filtered countries
  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCountries.slice(startIndex, endIndex);
  }, [filteredCountries, currentPage]);

  const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCountrySelect = (country: string) => {
    onCountrySelect?.(country);
    setIsOpen(false);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 h-auto p-2 hover:bg-accent/50 ${className}`}
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {currentCountry || "Select Country"}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Delivery Countries</h3>
            </div>
            <Badge variant="secondary" className="ml-auto text-xs">
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </div>
              ) : (
                `${countries.length} ${countries.length === 1 ? 'country' : 'countries'}`
              )}
            </Badge>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <Separator />

        {/* Countries List */}
        <ScrollArea className="h-64">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading countries...
                </span>
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "No countries found" : "No delivery countries available"}
                </p>
                {searchTerm && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search
                  </p>
                )}
              </div>
            ) : (
              <>
                {paginatedCountries.map((country) => (
                  <Button
                    key={country}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full justify-start h-auto p-3 mb-1 hover:bg-accent hover:shadow-sm transition-all duration-200 ${
                      currentCountry === country ? 'bg-accent border border-primary/20 shadow-sm' : 'border border-transparent'
                    }`}
                  >
                    <div className="flex items-center w-full">
                      <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium text-left flex-1">
                        {country}
                      </span>
                      <div className="flex items-center gap-2 ml-2">
                        {currentCountry === country && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        <Badge 
                          variant="secondary" 
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs"
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {!isLoading && filteredCountries.length > ITEMS_PER_PAGE && (
          <>
            <Separator />
            <div className="p-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} 
                <span className="ml-1">
                  ({filteredCountries.length} countries)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-7 px-2"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <Separator />
        <div className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            We're constantly expanding our delivery network
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
