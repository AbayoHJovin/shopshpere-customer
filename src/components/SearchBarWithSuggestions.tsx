"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { Search, Loader2, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "suggestion" | "category" | "brand" | "keyword";
  searchTerm?: string;
  categoryId?: string;
  brandId?: string;
  slug?: string;
}

interface SearchBarWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent, term?: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBarWithSuggestions({
  value,
  onChange,
  onSubmit,
  placeholder = "Search products, brands, and more...",
  className,
}: SearchBarWithSuggestionsProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value.trim() || value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `${API_BASE_URL}/products/search/suggestions?q=${encodeURIComponent(
            value
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        } else {
          console.warn("Failed to fetch suggestions:", response.status);
          setSuggestions([]);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching suggestions:", error);
        }
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Reduced debounce time for faster response
    const debounceTimer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchTerm = suggestion.searchTerm || suggestion.text;

    if (suggestion.type === "category" && suggestion.categoryId) {
      router.push(`/shop?categories=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === "brand" && suggestion.brandId) {
      router.push(`/shop?brands=${encodeURIComponent(suggestion.text)}`);
    } else {
      router.push(`/shop?searchTerm=${encodeURIComponent(searchTerm)}`);
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          onSubmit(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getSuggestionIcon = () => {
    return <Search className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <form onSubmit={onSubmit} className="relative">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (value.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            className="w-full pl-14 pr-24 h-14 text-lg rounded-lg border-2 focus:border-primary bg-background shadow-sm transition-all duration-200 focus:shadow-md"
          />
          <Search className="absolute left-4 h-6 w-6 text-muted-foreground" />
          {isLoading && (
            <Loader2 className="absolute right-28 h-5 w-5 animate-spin text-muted-foreground" />
          )}
          <Button
            type="submit"
            size="lg"
            className="absolute right-2 h-10 px-6 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <SearchIcon />
          </Button>
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <div className="text-sm">Searching...</div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3",
                  selectedIndex === index && "bg-accent",
                  index === 0 && "rounded-t-xl",
                  index === suggestions.length - 1 && "rounded-b-xl"
                )}
              >
                <div className="flex-shrink-0">{getSuggestionIcon()}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {suggestion.text}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <div className="text-sm">No suggestions found</div>
              <div className="text-xs mt-1">Try a different search term</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
