import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { Outfit, Poppins, Geist_Mono } from "next/font/google";
import { getTenantConfig } from "@/lib/tenants";
import { TenantProvider } from "@/components/providers/TenantProvider";

import { Toaster } from "@/components/ui/toaster";
import Providers from "@/app/providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
});

const fontMap: Record<string, string> = {
  "outfit": outfit.className,
  "poppins": poppins.className,
  "geist-mono": geistMono.className,
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id") || "default";
  const config = await getTenantConfig(tenantId);

  return {
    title: config.name,
    description: config.description || "Internet Banking Platform",
    icons: {
      icon: config.logo || "/favicon.ico", // Ideally you'd have a specific favicon field, falling back to logo or default
      apple: config.logo || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id") || "default";
  const config = await getTenantConfig(tenantId);

  const cookieStore = await cookies();
  const featuresCookie = cookieStore.get("flowbank_features");
  if (featuresCookie && featuresCookie.value) {
    try {
      const parsedFeatures = JSON.parse(decodeURIComponent(featuresCookie.value));
      if (Object.keys(parsedFeatures).length > 0) {
        config.features = parsedFeatures;
      }
    } catch (e) {}
  }

  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
						html:root {
							--primary: ${config.colors.primary};
							--primary-foreground: ${config.colors.primaryForeground};
							--accent: ${config.colors.accent};
							--accent-foreground: #ffffff;
							
							/* Light Mode Tinted Palette */
							--background: color-mix(in srgb, var(--primary) 2%, #ffffff);
							--card: color-mix(in srgb, var(--primary) 5%, #ffffff);
							--muted: color-mix(in srgb, var(--primary) 10%, #ffffff);
							--border: color-mix(in srgb, var(--primary) 15%, #ffffff);
							--input: color-mix(in srgb, var(--primary) 15%, #ffffff);
							--ring: var(--primary);
						}

						html.dark {
							/* Dark Mode Tinted Palette */
							--background: color-mix(in srgb, var(--primary) 8%, #0a0a0a);
							--card: color-mix(in srgb, var(--primary) 12%, #0a0a0a);
							--muted: color-mix(in srgb, var(--primary) 20%, #0a0a0a);
							--border: color-mix(in srgb, var(--primary) 25%, #0a0a0a);
							--input: color-mix(in srgb, var(--primary) 25%, #0a0a0a);
							--ring: var(--primary);
						}
					`,
          }}
        />
        {/* 
          Blocking script — runs synchronously before first paint.
          Reads the saved theme from localStorage and immediately overwrites
          the tenant's default --primary/--accent CSS variables so there
          is zero flash of the default color on refresh.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var THEMES = {
                purple: { primary: '#9333ea', accent: '#a855f7' },
                blue:   { primary: '#2563eb', accent: '#3b82f6' },
                red:    { primary: '#dc2626', accent: '#ef4444' },
                green:  { primary: '#16a34a', accent: '#22c55e' },
                orange: { primary: '#ea580c', accent: '#f97316' },
              };
              var saved = localStorage.getItem('flowbank_color_theme');
              if (saved && THEMES[saved]) {
                var root = document.documentElement;
                root.style.setProperty('--primary', THEMES[saved].primary);
                root.style.setProperty('--accent',  THEMES[saved].accent);
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${fontMap[config.font || "outfit"]} antialiased`}>
        <TenantProvider config={config}>
          <Providers>
            {children}

            <Toaster />
          </Providers>
        </TenantProvider>
      </body>
    </html>
  );
}
