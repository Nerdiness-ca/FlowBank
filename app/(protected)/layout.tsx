"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/footer";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar (Desktop) - Full height */}
      <div className="hidden md:flex flex-col h-full flex-shrink-0 z-20">
        <Sidebar />
      </div>

      {/* Right Column - Topbar, Main Content, Footer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Navbar */}
        <div className="flex-shrink-0 z-10">
          <Navbar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto hide-scrollbar p-4 md:p-6 pb-20">
          <RouteGuard>
            {children}
          </RouteGuard>
        </main>

        {/* Footer */}
        <div className="absolute bottom-0 w-full z-10 bg-white">
          <Footer />
        </div>
      </div>
    </div>
  );
}
