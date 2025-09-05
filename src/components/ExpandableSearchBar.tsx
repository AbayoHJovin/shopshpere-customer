"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { Search, X, Loader2 } from "lucide-react";
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

interface ExpandableSearchBarProps {
  className?: string;
  placeholder?: string;
  initialExpanded?: boolean;
}

export function ExpandableSearchBar({
  className,
  placeholder = "Search products, brands, and more...",
  initialExpanded = false,
}: ExpandableSearchBarProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        if (!searchTerm.trim()) {
          setIsExpanded(false);
        }
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(searchTerm)}`,
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
  }, [searchTerm]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (!searchTerm.trim()) {
      setIsExpanded(false);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSearch = (e: FormEvent, term?: string) => {
    e.preventDefault();
    const finalTerm = term || searchTerm;

    if (!finalTerm.trim()) return;

    // Navigate to shop with search query
    const searchParams = new URLSearchParams();
    searchParams.set("searchTerm", finalTerm.trim());
    router.push(`/shop?${searchParams.toString()}`);

    // Reset state
    setSearchTerm("");
    setIsExpanded(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "product" && suggestion.productId) {
      router.push(`/product/${suggestion.productId}`);
    } else if (suggestion.type === "category" && suggestion.categoryId) {
      router.push(`/shop?categories=${suggestion.categoryId}`);
    } else if (suggestion.type === "brand" && suggestion.brandId) {
      router.push(`/shop?brands=${suggestion.brandId}`);
    } else {
      handleSearch(new Event("submit") as any, suggestion.text);
    }
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
          handleSearch(e);
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
    <div
      ref={searchRef}
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        isExpanded ? "w-full" : "w-auto",
        className
      )}
    >
      {!isExpanded ? (
        // Collapsed state - just the search icon
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExpand}
          className="h-9 w-9 hover:bg-accent"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        // Expanded state - full search bar
        <div className="w-full">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 pr-12 h-11 rounded-lg border-2 focus:border-primary bg-background"
              />
              <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
              {isLoading && (
                <Loader2 className="absolute right-12 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCollapse}
                className="absolute right-1 h-9 w-9 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Search suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3",
                    selectedIndex === index && "bg-accent",
                    index === 0 && "rounded-t-lg",
                    index === suggestions.length - 1 && "rounded-b-lg"
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
      )}
    </div>
  );
}
