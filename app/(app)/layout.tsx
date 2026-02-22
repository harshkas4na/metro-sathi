"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

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

  // Show loading while auth state is initializing
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0066CC]" />
      </div>
    );
  }

  return <AppShell pendingCount={pendingCount}>{children}</AppShell>;
}
