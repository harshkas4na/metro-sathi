"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Search,
  PlusCircle,
  UserSearch,
  Users,
  UserCircle,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/search", label: "Find Companions", icon: Search },
  { href: "/trips/new", label: "Add Trip", icon: PlusCircle },
  { href: "/trips", label: "My Trips", icon: MapPin },
  { href: "/people", label: "Find People", icon: UserSearch },
  { href: "/connections", label: "Connections", icon: Users },
];

interface DesktopSidebarProps {
  pendingCount?: number;
}

export function DesktopSidebar({ pendingCount = 0 }: DesktopSidebarProps) {
  const pathname = usePathname();
  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile");

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r bg-white md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-5">
        <Image
          src="/logo/full-logo.png"
          alt="Metro Sathi"
          width={220}
          height={80}
          className=""
          priority
        />
      </div>

      {/* Nav Items */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/trips/new" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#E6F2FF] text-[#0066CC]"
                  : "text-[#666666] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.href === "/connections" && pendingCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[11px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile at bottom */}
      <div className="border-t p-4">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isProfileActive
              ? "bg-[#E6F2FF] text-[#0066CC]"
              : "text-[#666666] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
          )}
        >
          <UserCircle size={20} />
          <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
}
