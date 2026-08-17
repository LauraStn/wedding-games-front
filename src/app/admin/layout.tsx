"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "../../features/auth/RoleGuard";

const TABS = [
  { href: "/admin/participants", label: "Participants" },
  { href: "/admin/exclusions", label: "Exclusions" },
  { href: "/admin/roles", label: "Rôles" },
  { href: "/admin/lobby", label: "Salon" },
];

function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-layout__nav" aria-label="Sections d'administration">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`admin-layout__tab${pathname === tab.href ? " admin-layout__tab--active" : ""}`}
          aria-current={pathname === tab.href ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow={["ADMIN"]}>
      <div className="page admin-layout">
        <h1>Administration</h1>
        <AdminNav />
        <div className="admin-layout__content">{children}</div>
      </div>
    </RoleGuard>
  );
}
