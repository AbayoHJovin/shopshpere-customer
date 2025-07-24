import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  discount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  onLoadMore: () => void;
  showLoadMore?: boolean;
}

const ProductSection = ({ 
  title, 
  products, 
  onLoadMore, 
  showLoadMore = true 
}: ProductSectionProps) => {
  return (
    <section className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
      
      {showLoadMore && (
        <div className="text-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Products
          </Button>
        </div>
      )}
    </section>
  );
};

export default ProductSection; 