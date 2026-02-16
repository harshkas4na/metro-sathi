"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FA] px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
          <AlertTriangle size={32} className="text-[#EF4444]" />
        </div>
        <h1 className="text-xl font-semibold text-[#1A1A1A]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          An unexpected error occurred. Please try again.
        </p>
        <Button
          onClick={reset}
          className="mt-6 gap-2 bg-[#0066CC] hover:bg-[#0052A3]"
        >
          <RefreshCw size={16} />
          Try Again
        </Button>
      </div>
    </div>
  );
}
