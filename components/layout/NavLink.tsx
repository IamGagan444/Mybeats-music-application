"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The icon arrives as a rendered element, not a component: function props
 * can't cross the server/client boundary, but elements can.
 */
export function NavLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        "before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-brand before:transition-opacity",
        isActive
          ? "bg-surface-raised font-semibold text-foreground before:opacity-100"
          : "font-medium text-muted-foreground before:opacity-0 hover:bg-surface-raised/60 hover:text-foreground"
      )}
    >
      {children}
      {label}
    </Link>
  );
}
