"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Star,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/lib/store/hooks";
import {
  reviewService,
  ReviewDTO,
  CreateReviewDTO,
  UpdateReviewDTO,
} from "@/lib/services/reviewService";
import Link from "next/link";

interface ReviewSectionProps {
  productId: string;
  productName: string;
}

export default function ReviewSection({
  productId,
  productName,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    reviewCount: 0,
    ratingDistribution: [] as Array<[number, number]>,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDTO | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    content: "",
  });

  const [formErrors, setFormErrors] = useState({
    rating: "",
    title: "",
    content: "",
  });

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [productId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(
        productId,
        currentPage,
        10
      );
      if (response.success) {
        setReviews(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await reviewService.getProductReviewStats(productId);
      if (response.success) {
        setReviewStats(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching review stats:", error);
    }
  };

  const validateForm = () => {
    const errors = {
      rating: "",
      title: "",
      content: "",
    };

    if (formData.rating === 0) {
      errors.rating = "Please select a rating";
    }

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    } else if (formData.title.trim().length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    if (!formData.content.trim()) {
      errors.content = "Review content is required";
    } else if (formData.content.trim().length < 10) {
      errors.content = "Review content must be at least 10 characters";
    } else if (formData.content.trim().length > 1000) {
      errors.content = "Review content must be less than 1000 characters";
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleCreateReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }

    // Double-check token exists
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Authentication token not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors({ rating: "", title: "", content: "" });

      const reviewData: CreateReviewDTO = {
        productId,
        rating: formData.rating,
        title: formData.title.trim(),
        content: formData.content.trim(),
      };

      const response = await reviewService.createReview(reviewData);
      if (response.success) {
        toast({
          title: "Review Submitted",
          description: "Your review has been submitted successfully",
        });
        setFormData({ rating: 0, title: "", content: "" });
        setFormErrors({ rating: "", title: "", content: "" });
        fetchReviews();
        fetchReviewStats();
      }
    } catch (error: any) {
      console.error("Review submission error:", error);

      // Parse error message for specific field errors
      const errorMessage = error.message || "Failed to submit review";

      // Check if it's a "already reviewed" error
      if (errorMessage.includes("already reviewed")) {
        toast({
          title: "Review Already Exists",
          description:
            "You have already reviewed this product. You can edit your existing review instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      setSubmitting(true);
      const updateData: UpdateReviewDTO = {
        reviewId: editingReview.id,
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
      };

      const response = await reviewService.updateReview(updateData);
      if (response.success) {
        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully",
        });
        setShowEditDialog(false);
        setEditingReview(null);
        setFormData({ rating: 0, title: "", content: "" });
        fetchReviews();
        fetchReviewStats();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const response = await reviewService.deleteReview(reviewId);
      if (response.success) {
        toast({
          title: "Review Deleted",
          description: "Your review has been deleted successfully",
        });
        fetchReviews();
        fetchReviewStats();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleVoteReview = async (reviewId: number, isHelpful: boolean) => {
    try {
      await reviewService.voteReview(reviewId, isHelpful);
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to vote on review",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (review: ReviewDTO) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title,
      content: review.content,
    });
    setShowEditDialog(true);
  };

  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onStarClick?: (rating: number) => void
  ) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onStarClick?.(star)}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(
      ...reviewStats.ratingDistribution.map(([, count]) => count)
    );

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const distribution = reviewStats.ratingDistribution.find(
            ([r]) => r === rating
          );
          const count = distribution ? distribution[1] : 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm w-8">{rating}</span>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Review Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(reviewStats.averageRating))}
              <p className="text-sm text-gray-600 mt-2">
                Based on {reviewStats.reviewCount} reviews
              </p>
            </div>
            <Separator />
            {renderRatingDistribution()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-green-600 font-medium">
                    You are logged in
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Share your experience with {productName}
                </p>
                <div>
                  <label className="text-sm font-medium">Rating *</label>
                  <div className="mt-2">
                    {renderStars(formData.rating, true, (rating) =>
                      setFormData({ ...formData, rating })
                    )}
                  </div>
                  {formErrors.rating && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.rating}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) {
                        setFormErrors({ ...formErrors, title: "" });
                      }
                    }}
                    placeholder="Summarize your review"
                    className={`mt-2 ${
                      formErrors.title ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/100 characters
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Review *</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => {
                      setFormData({ ...formData, content: e.target.value });
                      if (formErrors.content) {
                        setFormErrors({ ...formErrors, content: "" });
                      }
                    }}
                    placeholder="Share your detailed experience..."
                    rows={4}
                    className={`mt-2 ${
                      formErrors.content ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.content && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.content.length}/1000 characters
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateReview}
                    disabled={
                      submitting ||
                      formData.rating === 0 ||
                      !formData.title.trim() ||
                      !formData.content.trim()
                    }
                    className="flex-1"
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Submit Review
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Please log in to write a review
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Login to Review</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading reviews...
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b pb-6 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {review.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            {review.isVerifiedPurchase && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(review)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {review.canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Review
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this review?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-lg">{review.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="text-gray-700 mb-4">{review.content}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVoteReview(review.id, true)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {review.helpfulVotes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVoteReview(review.id, false)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {review.notHelpfulVotes}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(totalPages - 1, currentPage + 1)
                        )
                      }
                      disabled={currentPage >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No reviews yet</p>
                <p className="text-sm text-gray-500">
                  Be the first to review this product!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update your review for {productName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rating *</label>
              {renderStars(formData.rating, true, (rating) =>
                setFormData({ ...formData, rating })
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Summarize your review"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Review *</label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Share your detailed experience..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateReview}
              disabled={
                submitting ||
                formData.rating === 0 ||
                !formData.title.trim() ||
                !formData.content.trim()
              }
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
