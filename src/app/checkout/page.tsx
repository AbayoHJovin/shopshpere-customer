import { Suspense } from 'react';
import { CheckoutClient } from './CheckoutClient';
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading checkout...</p>
      </div>
    }>
      <CheckoutClient />
    </Suspense>
  );
} 