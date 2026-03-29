"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Bell, Settings, LogOut, User } from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-card/80 backdrop-blur-lg px-4 sm:px-6">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="mr-3 lg:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-primary-foreground">B</span>
        </div>
        <span className="hidden text-base font-bold tracking-tight text-foreground sm:inline">
          BloodInsight
        </span>
      </Link>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <Avatar size="sm">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/settings" className="flex w-full items-center">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/settings" className="flex w-full items-center">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/login" className="flex w-full items-center">
                <LogOut className="mr-2 size-4" />
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
