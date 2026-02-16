import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FA] px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F3F5]">
          <MapPinOff size={32} className="text-[#999999]" />
        </div>
        <h1 className="text-xl font-semibold text-[#1A1A1A]">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button className="gap-2 bg-[#0066CC] hover:bg-[#0052A3]">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
