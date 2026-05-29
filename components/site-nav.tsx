"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Pencil, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/settings",
    label: "Configurações",
    icon: Settings,
    activeClass: "text-lime-600",
  },
  {
    href: "/copy-generator",
    label: "Copy",
    icon: Pencil,
    activeClass: "text-orange-500",
  },
  {
    href: "/image-generator",
    label: "Imagens",
    icon: Camera,
    activeClass: "text-orange-500",
  }
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
              isActive ? link.activeClass : "text-foreground/80"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}