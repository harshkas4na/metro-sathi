"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
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

  return <AppShell pendingCount={pendingCount}>{children}</AppShell>;
}
