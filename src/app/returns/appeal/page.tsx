"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ReturnService, ReturnRequest } from "@/lib/services/returnService";

interface AppealFormData {
  reason: string;
  description: string;
  mediaFiles: File[];
}

export default function AppealPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AppealFormData>({
    reason: "",
    description: "",
    mediaFiles: [],
  });

  const returnId = searchParams.get("returnId");

  useEffect(() => {
    const fetchReturnInfo = async () => {
      if (!returnId) {
        setError("No return ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const returnData = await ReturnService.getReturnById(Number(returnId));
        setReturnRequest(returnData);

        // Check if appeal is allowed
        if (returnData.status !== "DENIED") {
          setError("Appeals can only be submitted for denied return requests");
        } else if (returnData.returnAppeal) {
          setError("An appeal has already been submitted for this return request");
        }
      } catch (err: any) {
        console.error("Error fetching return info:", err);
        setError(err.message || "Failed to fetch return information");
      } finally {
        setLoading(false);
      }
    };

    fetchReturnInfo();
  }, [returnId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error("Some files were rejected. Only images and videos under 10MB are allowed.");
    }

    setFormData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...validFiles].slice(0, 5) // Max 5 files
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => {
      // Revoke the object URL to free up memory
      const fileToRemove = prev.mediaFiles[index];
      if (fileToRemove) {
        URL.revokeObjectURL(URL.createObjectURL(fileToRemove));
      }
      
      return {
        ...prev,
        mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
      };
    });
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      formData.mediaFiles.forEach(file => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [formData.mediaFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast.error("Please provide a reason for your appeal");
      return;
    }

    if (formData.mediaFiles.length === 0) {
      toast.error("At least one image or video is required for appeal submission");
      return;
    }

    try {
      setSubmitting(true);

      // Create FormData for file upload
      const appealFormData = new FormData();
      appealFormData.append("returnRequestId", returnId!);
      
      // Only append customerId if it exists and is not empty (for registered customers)
      if (returnRequest!.customerId && returnRequest!.customerId.trim() !== "") {
        appealFormData.append("customerId", returnRequest!.customerId);
      }
      
      appealFormData.append("reason", formData.reason);
      appealFormData.append("description", formData.description);
      
      formData.mediaFiles.forEach((file, index) => {
        appealFormData.append("mediaFiles", file);
      });

      await ReturnService.submitAppeal(appealFormData);
      
      toast.success("Appeal submitted successfully!");
      router.push(`/returns/info?returnId=${returnId}`);
    } catch (err: any) {
      console.error("Error submitting appeal:", err);
      
      // Enhanced error handling
      if (err.message?.includes("Appeal already exists")) {
        toast.error("An appeal has already been submitted for this return request");
      } else if (err.message?.includes("Appeal period has expired")) {
        toast.error("The appeal period for this return has expired");
      } else if (err.message?.includes("Only denied return requests")) {
        toast.error("Appeals can only be submitted for denied return requests");
      } else {
        toast.error(err.message || "Failed to submit appeal");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading return information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/track-order" className="hover:text-foreground">Track Order</Link>
          <span>/</span>
          <Link href={`/returns/info?returnId=${returnId}`} className="hover:text-foreground">Return Information</Link>
          <span>/</span>
          <span className="text-foreground">Submit Appeal</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Return Info
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Submit Appeal</h1>
            <p className="text-muted-foreground">
              Return Request #{returnRequest?.id} • Order #{returnRequest?.orderNumber}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Appeal Information
            </CardTitle>
            <CardDescription>
              Please provide detailed information about why you believe the return denial should be reconsidered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason */}
              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">Appeal Reason *</label>
                <Input
                  id="reason"
                  placeholder="Brief reason for your appeal (e.g., Item was actually defective)"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Detailed Description</label>
                <Textarea
                  id="description"
                  placeholder="Provide additional details about your appeal. Explain why you believe the original decision should be reconsidered."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Supporting Evidence *</label>
                <p className="text-sm text-muted-foreground">
                  Upload images or videos that support your appeal. At least one file is required.
                </p>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Upload Evidence</p>
                    <p className="text-xs text-muted-foreground">
                      Images and videos up to 10MB each (Max 5 files)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Select Files
                    </Button>
                  </div>
                </div>

                {/* Uploaded Files with Previews */}
                {formData.mediaFiles.length > 0 && (
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Uploaded Files ({formData.mediaFiles.length}/5)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.mediaFiles.map((file, index) => (
                        <div key={index} className="relative border rounded-lg p-3 bg-gray-50">
                          {/* Preview */}
                          <div className="mb-3">
                            {file.type.startsWith('image/') ? (
                              <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : file.type.startsWith('video/') ? (
                              <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                <video
                                  src={URL.createObjectURL(file)}
                                  className="w-full h-full object-cover"
                                  controls
                                  preload="metadata"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Paperclip className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* File Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[0]}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Important Notice */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Appeals are reviewed by our senior customer service team within 3-5 business days. 
                  Please ensure all information is accurate and complete as you can only submit one appeal per return request.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || formData.mediaFiles.length === 0}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Submit Appeal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
