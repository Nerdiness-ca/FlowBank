'use client';

import { useTenant } from "@/components/providers/TenantProvider";

const Footer = () => {
  const tenant = useTenant();

  return (
    <footer className="bg-primary text-primary-foreground px-6 py-4 sm:py-0 sm:h-10 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs flex-shrink-0 gap-3 sm:gap-0">
      <span className="text-center sm:text-left opacity-90">&copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.</span>
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 opacity-80">
        <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
        <a href="#" className="hover:opacity-100 transition-opacity">Terms of Use</a>
      </div>
    </footer>
  );
};

export default Footer;
