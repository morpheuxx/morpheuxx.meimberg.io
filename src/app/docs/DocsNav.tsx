"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/docs/schedule", label: "Schedule" },
  { href: "/docs/models", label: "Modelle & Pricing" },
] as const;

export function DocsNav() {
  const pathname = usePathname();

  return (
    <aside className="docs-nav">
      <div className="docs-nav-title">Docs</div>
      <nav>
        <ul>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`docs-nav-link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
