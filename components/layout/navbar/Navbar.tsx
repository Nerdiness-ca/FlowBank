"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/components/providers/TenantProvider";
import { appStore } from "@/store";
import { useColorTheme } from "@/components/providers/ColorThemeProvider";
import { format } from "date-fns";

// icons
import {
  Bell,
  Palette,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";

// ui
import { Button } from "@/components/ui/button";
import { SidebarMobile } from "@/components/layout/sidebar/SidebarMobile";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { userData, logout } = appStore();
  const tenant = useTenant();
  const { changeTheme, availableThemes } = useColorTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const name =
    (userData?.userRec as any)?.puserName ||
    userData?.userRec?.pUserName ||
    (userData?.userRec as any)?.name ||
    (userData?.userRec as any)?.userName ||
    "John Doe";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const firstName = name.split(" ")[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
      {/* Left: Mobile menu + Time */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarMobile />
        </div>
        <div className="hidden md:flex flex-col">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
            {format(currentTime, "EEEE, dd MMM yyyy")}
          </p>
          <p className="text-sm font-bold text-slate-700">
            {format(currentTime, "hh:mm:ss a")}
          </p>
        </div>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:bg-slate-100 rounded-full h-9 w-9"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <p className="px-2 py-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Color Theme
            </p>
            {availableThemes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => changeTheme(t.id)}
                className="flex items-center gap-3 cursor-pointer py-2"
              >
                <div
                  className="w-4 h-4 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: t.color }}
                />
                <span className="font-medium text-sm">{t.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification Bell */}
        {/* <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-full h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-white" />
        </Button> */}

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* User Dropdown */}
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 flex items-center gap-3 px-2 hover:bg-slate-50 rounded-xl"
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs text-slate-400 font-medium">
                    Welcome back,
                  </span>
                  <span className="text-sm font-bold text-slate-700 leading-none">
                    {firstName}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center font-bold text-primary">
                  {initials}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl border-slate-200"
            >
              <div className="p-3 border-b border-slate-100">
                <p className="font-bold text-slate-800">{name}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {(userData?.userRec as any)?.userName ||
                    userData?.userRec?.pUserName ||
                    "USER"}
                </p>
              </div>
              <DropdownMenuItem
                className="py-2.5 cursor-pointer text-slate-600 focus:text-slate-900"
                asChild
              >
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem
                onClick={logout}
                className="py-2.5 cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3 px-2 h-12">
            <div className="flex flex-col items-end hidden sm:flex space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
