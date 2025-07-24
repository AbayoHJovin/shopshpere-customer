import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const categories = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Books",
  "Beauty",
  "Automotive",
  "Toys",
  "Health"
];

const CategoryNav = () => {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-3 overflow-x-auto">
          {categories.map((category, index) => (
            <Button
              key={category}
              variant={index === 0 ? "default" : "ghost"}
              className={`whitespace-nowrap ${
                index === 0 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-muted"
              }`}
            >
              {category}
              {category === "All Categories" && <ChevronDown className="ml-1 h-4 w-4" />}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav; 