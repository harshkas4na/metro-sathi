"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  console.log("[APP-LAYOUT] render: loading=", loading, "| user=", user ? user.id : "NULL");

  // Client-side auth guard: redirect to landing if not logged in
  useEffect(() => {
    console.log("[APP-LAYOUT] auth guard effect: loading=", loading, "| user=", user ? user.id : "NULL");
    if (!loading && !user) {
      console.log("[APP-LAYOUT] No user, redirecting to /");
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchPendingCount = async () => {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.pendingCount ?? 0);
      }
    };

    fetchPendingCount();

    // Poll every 30 seconds for new connection requests
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0066CC]" />
      </div>
    );
  }

  // Don't render app content if not authenticated
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0066CC]" />
      </div>
    );
  }

  return <AppShell pendingCount={pendingCount}>{children}</AppShell>;
}
