"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  TrendingUp,
  ListChecks,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Upload",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    label: "Trends",
    href: "/dashboard/trends",
    icon: TrendingUp,
  },
  {
    label: "Actions",
    href: "/dashboard/actions",
    icon: ListChecks,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">
                B
              </span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              BloodInsight
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        {sidebarContent}
      </aside>
    </>
  );
}
