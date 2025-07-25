"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Check, ShoppingCart, Share2, Clock, Truck, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import { allProducts } from "@/data/products";

// Add proper type definition for sizes
interface ProductSize {
  sizeId: string;
  size: string;
  stockForSize: number;
}

// Fix the category issue by updating type
interface ProductCategory {
  name: string;
  categoryId?: string;
}

// Define a proper review interface
interface ProductReview {
  ratingId: string;
  userName: string;
  rating: number;
  stars?: number;  // Make stars optional
  comment: string;
  date: string;
  helpful: number;
  userProfilePicture?: string;
  username?: string;
  verifiedPurchase?: boolean;
  createdAt?: string;
}

// Add activeDiscount to the product structure
const mockProductData = {
  id: "1",
  name: "Premium Cotton T-Shirt",
  description: "A super comfortable, lightweight t-shirt perfect for everyday wear.",
  price: 29.99,
  discountedPrice: 24.99,
  previousPrice: 29.99,
  discountPercentage: 17,
  mainImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  images: [
    { imageId: "img1", imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b", isMain: true, position: 0 },
    { imageId: "img2", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", isMain: false, position: 1 },
    { imageId: "img3", imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083", isMain: false, position: 2 },
    { imageId: "img4", imageUrl: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29", isMain: false, position: 3 }
  ],
  categories: [
    { name: "clothing", categoryId: "cat1" },
    { name: "t-shirts", categoryId: "cat2" }
  ] as ProductCategory[],
  brand: "FashionBrand",
  sizes: [
    { sizeId: "s", size: "S", stockForSize: 10 },
    { sizeId: "m", size: "M", stockForSize: 15 },
    { sizeId: "l", size: "L", stockForSize: 5 },
    { sizeId: "xl", size: "XL", stockForSize: 0 }
  ] as ProductSize[],
  colors: [
    { colorId: "color1", colorName: "Midnight Black", colorHexCode: "#000000" },
    { colorId: "color2", colorName: "Silver", colorHexCode: "#C0C0C0" },
    { colorId: "color3", colorName: "Navy Blue", colorHexCode: "#000080" }
  ],
  stock: 30,
  rating: 4.5,
  ratingCount: 120,
  reviews: [
    {
      ratingId: "rating1",
      userName: "John D.",
      username: "John D.",
      rating: 5,
      stars: 5,
      comment: "These headphones are amazing! The noise cancellation is perfect for my daily commute.",
      date: "2023-05-15",
      createdAt: "2023-05-15",
      helpful: 8,
      userProfilePicture: "https://i.pravatar.cc/150?u=1",
      verifiedPurchase: true
    },
    {
      ratingId: "rating2",
      userName: "Sarah M.",
      username: "Sarah M.",
      rating: 4,
      stars: 4,
      comment: "Great sound quality and comfortable fit. Battery life is good but not as long as advertised.",
      date: "2023-04-22",
      createdAt: "2023-04-22",
      helpful: 5,
      userProfilePicture: "https://i.pravatar.cc/150?u=2",
      verifiedPurchase: true
    }
  ] as ProductReview[],
  discounts: [
    {
      discountId: "disc1",
      name: "Summer Sale",
      description: "20% off on all products during summer",
      percentage: 20,
      startDate: "2023-06-01",
      endDate: "2023-08-31",
      current: true
    },
  ],
  activeDiscount: {
    discountId: "disc1",
    name: "Summer Sale",
    description: "20% off on all products during summer",
    percentage: 20,
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    current: true
  },
  onSale: true
};

export function ProductPageClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState(mockProductData);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  
  // Check if product is in cart on component mount
  useEffect(() => {
    // In a real app, we would fetch the product data based on the ID parameter
    console.log(`Product ID: ${productId}`);
    
    try {
      // Check if product is in cart
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        setIsInCart(cart.includes(productId));
      }
      
      // Check if product is in wishlist (if we had that functionality)
      // const wishlistData = localStorage.getItem('wishlist');
      // if (wishlistData) {
      //   const wishlist = JSON.parse(wishlistData);
      //   setIsInWishlist(wishlist.includes(id));
      // }
    } catch (error) {
      console.error('Error checking product status:', error);
    }
  }, [productId]);
  
  // Handle adding to cart
  const handleCartToggle = () => {
    try {
      const cartData = localStorage.getItem('cart');
      const cart = cartData ? JSON.parse(cartData) : [];
      
      if (isInCart) {
        // Remove from cart
        const newCart = cart.filter((cartId: string) => cartId !== productId);
        localStorage.setItem('cart', JSON.stringify(newCart));
        setIsInCart(false);
      } else {
        // Add to cart
        const newCart = [...cart, productId];
        localStorage.setItem('cart', JSON.stringify(newCart));
        setIsInCart(true);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };
  
  // Generate similar products
  const similarProducts = allProducts
    .filter(p => p.id !== productId && (p.categories?.some(cat => 
      product.categories.some(pcat => pcat.name === cat)
    ) || true)) // For demo, include all products but would filter by shared category
    .slice(0, 4);
    
  // Calculate the number of full stars for the rating display
  const fullStars = Math.floor(product.rating);
  
  // Handle submitting a review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the review to the backend
    alert(`Review submitted: ${rating} stars, ${reviewText}`);
    setRating(0);
    setReviewText("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/50">
        <div className="container mx-auto px-4 py-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">Shop</Link>
            {product.categories.map((category, index) => (
              <div key={category.categoryId} className="flex items-center">
                <span>/</span>
                <Link 
                  href={`/shop?category=${category.name}`} 
                  className="hover:text-primary"
                >
                  {category.name}
                </Link>
              </div>
            ))}
            <span>/</span>
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted">
              <img
                src={product.images[selectedImage].imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {product.onSale && (
                <Badge variant="destructive" className="absolute top-4 left-4">
                  {Math.round(Number(product.activeDiscount?.percentage))}% OFF
                </Badge>
              )}
              
              {/* Image navigation buttons */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() => setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <div
                    key={image.imageId}
                    className={`cursor-pointer rounded-md border overflow-hidden w-20 h-20 flex-shrink-0 ${
                      selectedImage === index ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`Product view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {/* Product categories as small badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                {product.categories.map(category => (
                  <Badge key={category.categoryId} variant="outline" className="text-xs">
                    {category.name}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < fullStars
                          ? "fill-rating-star text-rating-star"
                          : i < product.rating
                            ? "text-rating-star fill-rating-star/50" 
                            : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">
                  {product.rating.toFixed(1)} ({product.ratingCount} reviews)
                </span>
              </div>
              
              {/* Price */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-bold text-price">
                  ${product.discountedPrice.toFixed(2)}
                </span>
                {product.previousPrice > product.discountedPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.previousPrice.toFixed(2)}
                  </span>
                )}
                {product.onSale && (
                  <Badge variant="destructive" className="ml-2">
                    {Math.round(Number(product.activeDiscount?.percentage))}% OFF
                  </Badge>
                )}
              </div>
              
              {/* Brief Description */}
              <p className="mt-4 text-muted-foreground">
                {product.description}
              </p>
            </div>
            
            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Color: {product.colors.find(c => c.colorId === selectedColor)?.colorName || "Select a color"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.colorId}
                      className={`w-10 h-10 rounded-full border ${
                        selectedColor === color.colorId ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color.colorHexCode }}
                      onClick={() => setSelectedColor(color.colorId)}
                      aria-label={color.colorName}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Size: {product.sizes.find(s => s.sizeId === selectedSize)?.size || "Select a size"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.sizeId}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        selectedSize === size.sizeId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-muted'
                      } ${size.stockForSize === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => setSelectedSize(size.sizeId)}
                      disabled={size.stockForSize === 0}
                    >
                      {size.size}
                      {size.stockForSize === 0 && " (Out of stock)"}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center border rounded-md mt-1">
                  <button
                    className="px-3 py-2 hover:bg-muted disabled:opacity-50"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    className="px-3 py-2 hover:bg-muted disabled:opacity-50"
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Availability</label>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant={product.stock > 0 ? "outline" : "destructive"} className="text-xs">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {product.stock > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({product.stock} available)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                className={`flex-1 ${isInCart ? 'bg-success hover:bg-success/90' : ''}`}
                onClick={handleCartToggle}
                disabled={product.stock === 0}
              >
                {isInCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button variant="outline" size="icon" className="hidden sm:flex">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">30 Day Returns</p>
                  <p className="text-xs text-muted-foreground">Hassle-free returns</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">2 Year Warranty</p>
                  <p className="text-xs text-muted-foreground">Full coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Details Tabs */}
      <section className="container mx-auto px-4 py-8 border-t">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-muted-foreground">
            <p>{product.description}</p>
            <p className="mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id augue at nunc cursus fermentum. 
              Integer facilisis, velit vitae vestibulum eleifend, sem velit vehicula tortor, 
              nec ultrices erat felis nec quam. Donec eget turpis semper, commodo ante sed, faucibus mi. 
              Phasellus sodales pellentesque ex, at iaculis ligula. Fusce sodales mi id tincidunt posuere.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1">
              <li>Feature 1: High-quality audio with deep bass</li>
              <li>Feature 2: Active noise cancellation</li>
              <li>Feature 3: 30-hour battery life</li>
              <li>Feature 4: Fast charging (10 min for 5 hours playback)</li>
              <li>Feature 5: Bluetooth 5.0 connectivity</li>
            </ul>
          </TabsContent>
          <TabsContent value="specifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Technical Specifications</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-muted-foreground">Bluetooth Version</span>
                    <span>5.0</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-muted-foreground">Battery Life</span>
                    <span>Up to 30 hours</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-muted-foreground">Charging Time</span>
                    <span>3 hours</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-muted-foreground">Driver Size</span>
                    <span>40mm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-muted-foreground">Frequency Response</span>
                    <span>20Hz - 20kHz</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">In The Box</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>1 x Wireless Headphones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>1 x USB-C Charging Cable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>1 x 3.5mm Audio Cable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>1 x Carrying Case</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>1 x User Manual</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="text-muted-foreground">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
                <p>We offer free standard shipping on all orders over $50. For orders under $50, shipping costs are calculated at checkout based on delivery location.</p>
                <ul className="list-disc list-inside mt-4 space-y-1">
                  <li>Standard Shipping: 3-5 business days</li>
                  <li>Express Shipping: 1-2 business days (additional fee)</li>
                  <li>International Shipping: 7-14 business days (varies by location)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Return Policy</h3>
                <p>We accept returns within 30 days of delivery for a full refund or exchange. Items must be in original, unused condition with all original packaging and tags attached.</p>
                <p className="mt-2">Please note that the customer is responsible for return shipping costs unless the return is due to a defect or error on our part.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Warranty Information</h3>
                <p>This product comes with a 2-year manufacturer's warranty covering defects in materials and workmanship. For warranty claims, please contact our customer service team.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Similar Products */}
      <section className="container mx-auto px-4 py-12 border-t">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Similar Products</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/shop">View More</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {similarProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice || undefined}
              rating={product.rating}
              reviewCount={product.reviewCount}
              image={product.image}
              discount={product.discount}
              isNew={product.isNew}
              isBestseller={product.isBestseller}
            />
          ))}
        </div>
      </section>
      
      {/* Customer Reviews */}
      <section className="container mx-auto px-4 py-12 border-t">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex flex-col items-center p-6 bg-muted/30 rounded-lg">
              <span className="text-4xl font-bold">{product.rating.toFixed(1)}</span>
              <div className="flex my-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < fullStars 
                        ? "fill-rating-star text-rating-star" 
                        : i < product.rating 
                          ? "text-rating-star fill-rating-star/50"
                          : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Based on {product.ratingCount} reviews
              </span>
            </div>
            
            {/* Add Review Form */}
            <div className="p-6 border rounded-lg">
              <h3 className="font-medium text-lg mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Rating
                  </label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating 
                              ? "fill-rating-star text-rating-star" 
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Your Review
                  </label>
                  <textarea
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                <Button type="submit" disabled={rating === 0 || reviewText.trim() === ""}>
                  Submit Review
                </Button>
              </form>
            </div>
          </div>
          
          {/* Review List */}
          <div className="lg:col-span-2">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.ratingId} className="p-6 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                          {review.userProfilePicture && (
                            <img 
                              src={review.userProfilePicture} 
                              alt={review.username}
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{review.username}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-rating-star text-rating-star" 
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            {review.verifiedPurchase && (
                              <Badge variant="outline" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
                
                {/* Show more reviews button if there are more than shown */}
                {product.ratingCount > product.reviews.length && (
                  <Button variant="outline" className="w-full">
                    Load More Reviews
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center border rounded-lg bg-muted/30">
                <p className="text-lg font-medium">No reviews yet</p>
                <p className="text-muted-foreground mt-1">Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 