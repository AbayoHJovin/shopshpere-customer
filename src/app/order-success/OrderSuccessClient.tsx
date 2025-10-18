"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { 
  CheckCircle2, 
  Download, 
  FileText, 
  ExternalLink, 
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadAttempted, setDownloadAttempted] = useState(false);
  const [autoDownloadSuccess, setAutoDownloadSuccess] = useState<boolean | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const number = searchParams.get("orderNumber");
    if (!number) {
      // Redirect to home if no order number is provided
      router.push("/");
      return;
    }
    setOrderNumber(number);
    
    // Attempt to download QR code automatically after a short delay
    const timer = setTimeout(() => {
      handleDownloadQR(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [searchParams, router]);
  
  // Handle QR code download
  const handleDownloadQR = async (isAuto = false) => {
    if (!orderNumber || !qrRef.current) return;
    
    try {
      setDownloading(true);
      
      // Get the SVG from the ref
      const svgElement = qrRef.current.querySelector("svg");
      if (!svgElement) throw new Error("QR code SVG not found");
      
      // Create a canvas to convert SVG to image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");
      
      // Set canvas dimensions
      const svgRect = svgElement.getBoundingClientRect();
      canvas.width = svgRect.width * 2; // Higher resolution
      canvas.height = svgRect.height * 2; // Higher resolution
      
      // Draw white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Convert SVG to an image
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      
      // Create a Blob from the SVG data
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      
      // Create object URL from Blob
      const DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svgBlob);
      
      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          DOMURL.revokeObjectURL(url);
          
          try {
            // Convert canvas to image
            const imgURL = canvas.toDataURL("image/png");
            
            // Create download link
            const downloadLink = document.createElement("a");
            downloadLink.href = imgURL;
            downloadLink.download = `ShopSphere-Order-${orderNumber}.png`;
            
            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            if (isAuto) {
              setAutoDownloadSuccess(true);
              toast.success("QR code has been automatically downloaded");
            } else {
              toast.success("QR code downloaded successfully");
            }
            
            resolve();
          } catch (err) {
            console.error("Error creating download link:", err);
            if (isAuto) setAutoDownloadSuccess(false);
            reject(err);
          }
        };
        
        img.onerror = () => {
          DOMURL.revokeObjectURL(url);
          console.error("Error loading image");
          if (isAuto) setAutoDownloadSuccess(false);
          reject(new Error("Error loading image"));
        };
        
        img.src = url;
      });
    } catch (error) {
      console.error("Error downloading QR code:", error);
      if (isAuto) setAutoDownloadSuccess(false);
      toast.error("Failed to download QR code. Please try the manual download button.");
    } finally {
      setDownloading(false);
      setDownloadAttempted(true);
    }
  };
  
  const handleManualDownload = () => {
    handleDownloadQR(false);
  };
  
  if (!orderNumber) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-lg text-muted-foreground">Loading order information...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-full bg-success/20 p-3 mb-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-center">Order Placed Successfully!</h1>
          <p className="text-center text-muted-foreground">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-muted-foreground">Order Number:</p>
                <p className="text-xl font-semibold">{orderNumber}</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/track-order" className="flex items-center gap-1">
                  <FileText className="h-4 w-4 mr-1" />
                  Track Order
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-md mb-4" ref={qrRef}>
                <QRCodeSVG 
                  value={`ShopSphere:Order:${orderNumber}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/logo.png",
                    excavate: true,
                    height: 40,
                    width: 40,
                  }}
                />
              </div>
              
              {autoDownloadSuccess === false && (
                <div className="w-full bg-amber-50 text-amber-900 rounded-[2px] p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Automatic download failed</p>
                      <p className="text-sm mt-1">
                        Please use the button below to download your QR code.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {autoDownloadSuccess === true && (
                <div className="w-full bg-success/10 text-success rounded-[2px] p-4 mb-4">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">QR Code Downloaded</p>
                      <p className="text-sm mt-1">
                        Your order QR code has been automatically downloaded to your device.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="w-full space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleManualDownload}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-muted-foreground text-center">
                  Please save this QR code. You'll need it to track your order.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            We've sent a confirmation email with all the details to your email address.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/track-order" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Track Order
              </Link>
            </Button>
            
            <Button asChild>
              <Link href="/shop" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 