"use client";

import { useState, useEffect } from "react";
import { ManyProductsDto } from "@/lib/productService";
import {
  similarProductsService,
  SimilarProductsRequest,
} from "@/lib/services/similarProductsService";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Users, Star, TrendingUp, Tag } from "lucide-react";

interface SimilarProductsProps {
  productId: string;
  title?: string;
  algorithm?: "brand" | "category" | "keywords" | "popular" | "mixed";
  maxProducts?: number;
  showAlgorithmSelector?: boolean;
}

const algorithmLabels = {
  brand: "Same Brand",
  category: "Same Category",
  keywords: "Similar Keywords",
  popular: "Popular Products",
  mixed: "Recommended",
};

const algorithmIcons = {
  brand: Tag,
  category: Tag,
  keywords: Star,
  popular: TrendingUp,
  mixed: Users,
};

export default function SimilarProducts({
  productId,
  title = "Similar Products",
  algorithm = "mixed",
  maxProducts = 12,
  showAlgorithmSelector = false,
}: SimilarProductsProps) {
  const [products, setProducts] = useState<ManyProductsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(algorithm);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSimilarProducts = async (
    page: number = 0,
    algo: string = currentAlgorithm
  ) => {
    try {
      setLoading(true);
      setError(null);

      const request: SimilarProductsRequest = {
        productId,
        page,
        size: maxProducts,
        includeOutOfStock: true,
        algorithm: algo as any,
      };

      const response = await similarProductsService.getSimilarProducts(request);

      if (response.success) {
        setProducts(response.data.content);
        setCurrentPage(response.data.page);
        setHasNextPage(response.data.hasNext);
        setHasPreviousPage(response.data.hasPrevious);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message || "Failed to load similar products");
      }
    } catch (err: any) {
      console.error("Error fetching similar products:", err);
      setError(err.message || "Failed to load similar products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilarProducts(0, currentAlgorithm);
  }, [productId, currentAlgorithm]);

  const handleAlgorithmChange = (newAlgorithm: string) => {
    setCurrentAlgorithm(
      newAlgorithm as "brand" | "category" | "keywords" | "popular" | "mixed"
    );
    fetchSimilarProducts(0, newAlgorithm);
  };

  const handlePageChange = (page: number) => {
    fetchSimilarProducts(page, currentAlgorithm);
  };

  const handleRefresh = () => {
    fetchSimilarProducts(currentPage, currentAlgorithm);
  };

  if (loading && products.length === 0) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading similar products...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const AlgorithmIcon =
    algorithmIcons[currentAlgorithm as keyof typeof algorithmIcons];

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlgorithmIcon className="h-3 w-3" />
            {algorithmLabels[currentAlgorithm as keyof typeof algorithmLabels]}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {showAlgorithmSelector && (
            <div className="flex gap-1">
              {Object.keys(algorithmLabels).map((algo) => (
                <Button
                  key={algo}
                  variant={currentAlgorithm === algo ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAlgorithmChange(algo)}
                  className="text-xs"
                >
                  {algorithmLabels[algo as keyof typeof algorithmLabels]}
                </Button>
              ))}
            </div>
          )}

          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            id={product.productId}
            name={product.productName}
            price={product.price}
            discountedPrice={product.discountedPrice}
            image={product.primaryImage?.imageUrl}
            rating={product.averageRating || 0}
            reviewCount={product.reviewCount || 0}
            hasActiveDiscount={product.hasActiveDiscount}
            discount={product.discountInfo?.percentage}
            discountName={product.discountInfo?.name}
            discountEndDate={product.discountInfo?.endDate}
            hasVariantDiscounts={false}
            maxVariantDiscount={0}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPreviousPage || loading}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum =
                Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || loading}
          >
            Next
          </Button>
        </div>
      )}

      {loading && products.length > 0 && (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">
            Loading more products...
          </span>
        </div>
      )}
    </div>
  );
}
