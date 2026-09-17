import fs from 'fs/promises';
import path from 'path';

export type TenantConfig = {
  id: string;
  name: string;
  logo: string;
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
  };
  api: {
    baseUrl: string;
    version: string;
  };
  advert?: {
    title: string;
    description: string;
    buttonText: string;
    link: string;
    images: string[];
  };
  features?: {
    [key: string]: boolean;
  };
  font?: "outfit" | "geist-mono" | "poppins";
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  backgroundImage?: string;
};

// Fallback config in case the public/tenant-config.json file is ever accidentally deleted
const fallbackConfig: TenantConfig = {
  id: "default",
  name: "FlowBank",
  logo: "/assets/logo.png",
  colors: {
    primary: "#171717",
    primaryForeground: "#ffffff",
    accent: "#171717",
  },
  api: {
    baseUrl: "https://api.flowbank.com",
    version: "v1"
  },
  features: {},
  font: "outfit",
  advert: {
    title: "InvestToday 3.0",
    description: "Visit our website to check out our investment plans and invest with us today!",
    buttonText: "Learn More",
    link: "#",
    images: [
      "https://images.unsplash.com/photo-1719937050445-098888c0625e?q=80&w=1374&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1725714835081-118a2b0456b2?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1726134212431-c794fd3d0c34?q=80&w=1335&auto=format&fit=crop"
    ]
  },
  description: "Secure Internet Banking Platform. Manage your wealth efficiently and securely.",
  contactPhone: "+1 (555) 000-0000",
  contactEmail: "support@flowbank.io",
  facebook: "https://facebook.com/flowbank",
  instagram: "https://instagram.com/flowbank",
  whatsapp: "+15550000000",
  backgroundImage: "/assets/background.png"
};

export async function getTenantConfig(institutionId?: string): Promise<TenantConfig> {
  try {
    // Dynamically read the tenant-config.json deployed in the public directory
    const configPath = path.join(process.cwd(), 'public', 'tenant-config.json');
    const fileContent = await fs.readFile(configPath, 'utf8');
    const config: TenantConfig = JSON.parse(fileContent);
    return config;
  } catch (error) {
    console.error("Failed to load public/tenant-config.json. Booting with fallback config.", error);
    return fallbackConfig;
  }
}
