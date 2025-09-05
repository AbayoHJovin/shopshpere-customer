"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "product" | "category" | "brand" | "keyword";
  productId?: string;
  categoryId?: string;
  brandId?: string;
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
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(value)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "product" && suggestion.productId) {
      router.push(`/products/${suggestion.productId}`);
    } else if (suggestion.type === "category" && suggestion.categoryId) {
      router.push(`/shop?categories=${suggestion.categoryId}`);
    } else if (suggestion.type === "brand" && suggestion.brandId) {
      router.push(`/shop?brands=${suggestion.brandId}`);
    } else {
      onSubmit(new Event("submit") as any, suggestion.text);
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

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "product":
        return "🔍";
      case "category":
        return "📂";
      case "brand":
        return "🏷️";
      default:
        return "💡";
    }
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
              if (value.length >= 2 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="w-full pl-14 pr-24 h-14 text-lg rounded-xl border-2 focus:border-primary bg-background shadow-sm transition-all duration-200 focus:shadow-md"
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
            Search
          </Button>
        </div>
      </form>

      {/* Search suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
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
              <span className="text-lg">
                {getSuggestionIcon(suggestion.type)}
              </span>
              <div className="flex-1">
                <div className="font-medium text-sm">{suggestion.text}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {suggestion.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
