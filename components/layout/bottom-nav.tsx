"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  PlusCircle,
  UserSearch,
  Users,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/trips/new", label: "Add Trip", icon: PlusCircle, isCenter: true },
  { href: "/people", label: "People", icon: UserSearch },
  { href: "/connections", label: "Connects", icon: Users },
];

interface BottomNavProps {
  pendingCount?: number;
}

export function BottomNav({ pendingCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/dashboard" && pathname === "/dashboard") ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1",
                item.isCenter && "-mt-3"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  item.isCenter
                    ? "h-12 w-12 bg-[#0066CC] text-white shadow-lg"
                    : "h-8 w-8",
                  !item.isCenter && isActive
                    ? "text-[#0066CC]"
                    : !item.isCenter && "text-[#999999]"
                )}
              >
                <Icon size={item.isCenter ? 24 : 22} />
                {item.href === "/connections" && pendingCount > 0 && (
                  <span
                    aria-label={`${pendingCount} pending requests`}
                    className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white"
                  >
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  item.isCenter && "text-[#0066CC]",
                  !item.isCenter && isActive
                    ? "text-[#0066CC]"
                    : !item.isCenter && "text-[#999999]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
