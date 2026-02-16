"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App section error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center py-20">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
          <AlertTriangle size={32} className="text-[#EF4444]" />
        </div>
        <h1 className="text-xl font-semibold text-[#1A1A1A]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          We hit an unexpected error. Please try again.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2 bg-[#0066CC] hover:bg-[#0052A3]"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <Home size={16} />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
