import { Suspense } from 'react';
import { AccountClient } from './AccountClient';
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading account information...</p>
      </div>
    }>
      <AccountClient />
    </Suspense>
  );
} 