"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterService, CategoryDTO, Page } from "@/lib/filterService";

const CategoryNav = () => {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [allCategories, setAllCategories] = useState<Page<CategoryDTO> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Determine how many categories to show based on screen width
  const getVisibleCategoriesCount = () => {
    if (typeof window === "undefined") return 6;

    const width = window.innerWidth;
    if (width < 640) return 3; // sm
    if (width < 768) return 4; // md
    if (width < 1024) return 5; // lg
    if (width < 1280) return 6; // xl
    return 8; // 2xl+
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCategoriesCount());

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(getVisibleCategoriesCount());
    };

    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesPage = await FilterService.fetchCategories(
          0,
          visibleCount + 1
        );
        setCategories(categoriesPage.content);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [visibleCount]);

  const fetchAllCategories = async (page: number) => {
    try {
      const categoriesPage = await FilterService.fetchCategories(page, 20);
      setAllCategories(categoriesPage);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching all categories:", error);
    }
  };

  const handleAllCategoriesClick = () => {
    if (!allCategories) {
      fetchAllCategories(0);
    }
    setShowAllCategories(true);
  };

  if (loading) {
    return (
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            <DropdownMenu
              open={showAllCategories}
              onOpenChange={setShowAllCategories}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  className="bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
                >
                  All Categories
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                {allCategories ? (
                  <div className="p-2">
                    <div className="grid grid-cols-2 gap-1">
                      {allCategories.content.map((category) => (
                        <DropdownMenuItem key={category.categoryId} asChild>
                          <Link
                            href={`/shop?categories=${encodeURIComponent(
                              category.name
                            )}`}
                            className="flex flex-col items-start p-2 hover:bg-muted rounded"
                          >
                            <span className="font-medium">{category.name}</span>
                            {category.productCount && (
                              <span className="text-xs text-muted-foreground">
                                {category.productCount} products
                              </span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchAllCategories(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage + 1} of {allCategories.totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchAllCategories(currentPage + 1)}
                        disabled={currentPage >= allCategories.totalPages - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Loading categories...
                    </p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {categories.slice(0, visibleCount).map((category) => (
              <Button
                key={category.categoryId}
                variant="ghost"
                className="whitespace-nowrap hover:bg-muted"
                asChild
              >
                <Link
                  href={`/shop?categories=${encodeURIComponent(category.name)}`}
                >
                  {category.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default CategoryNav;
