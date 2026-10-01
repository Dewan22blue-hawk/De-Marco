'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, LayoutDashboard, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBreadcrumbLabel } from '@/lib/breadcrumb-config'

export interface BreadcrumbItemOverride {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /** Memungkinkan pemanggilan kustom untuk override segmen URL tertentu */
  overrides?: Record<string, string | BreadcrumbItemOverride>;
  /** Sembunyikan segmen akar (misal: /dashboard) jika diperlukan */
  hideRoot?: boolean;
  /** Class tambahan untuk container luar */
  className?: string;
}

export function Breadcrumb({ overrides, hideRoot = false, className }: BreadcrumbProps) {
  const pathname = usePathname();
  
  if (!pathname) return null;

  // Hapus trailing slash & bagi segment
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) return null;

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    
    // Override handling
    const override = overrides?.[segment];
    let label = '';
    let customHref = href;
    
    if (typeof override === 'string') {
      label = override;
    } else if (override && typeof override === 'object') {
      label = override.label;
      if (override.href) customHref = override.href;
    } else {
      label = formatBreadcrumbLabel(segment, undefined);
    }

    return {
      segment,
      href: customHref,
      label,
      isLast
    };
  });

  const visibleBreadcrumbs = hideRoot ? breadcrumbs.filter(b => b.segment !== 'dashboard') : breadcrumbs;

  if (visibleBreadcrumbs.length === 0) return null;

  const renderBreadcrumbs = () => {
    if (visibleBreadcrumbs.length <= 3) {
      return visibleBreadcrumbs.map((crumb, idx) => (
        <BreadcrumbItem key={crumb.href} crumb={crumb} isFirst={idx === 0 && !hideRoot && crumb.segment === 'dashboard'} />
      ));
    }

    // Mobile: > 3 items
    return visibleBreadcrumbs.map((crumb, idx) => {
      const isFirst = idx === 0 && !hideRoot && crumb.segment === 'dashboard';
      const isLast = crumb.isLast;
      const isSecondToLast = idx === visibleBreadcrumbs.length - 2;
      const isMiddle = !isFirst && !isLast && !isSecondToLast;

      return (
        <React.Fragment key={crumb.href}>
          {isMiddle && idx === 1 && (
            <div className="flex sm:hidden items-center gap-2 text-outline/50" aria-hidden="true">
              <MoreHorizontal className="w-4 h-4 shrink-0" />
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          )}
          <div className={cn("items-center gap-2", isMiddle ? "hidden sm:flex" : "flex")}>
            <BreadcrumbItem crumb={crumb} isFirst={isFirst} />
          </div>
        </React.Fragment>
      )
    })
  }

  return (
    <nav aria-label="Breadcrumb" className={cn(
      "bg-surface-container-lowest/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-outline-variant/10 inline-flex items-center gap-2 overflow-hidden",
      className
    )}>
      {renderBreadcrumbs()}
    </nav>
  )
}

function BreadcrumbItem({ crumb, isFirst }: { crumb: { href: string; label: string; isLast: boolean; segment: string }, isFirst: boolean }) {
  const { href, label, isLast } = crumb;
  
  return (
    <div className="flex items-center gap-2">
      {isLast ? (
        <span 
          aria-current="page"
          className="text-on-surface font-semibold text-sm pointer-events-none whitespace-nowrap flex items-center gap-1.5"
        >
          {isFirst && <LayoutDashboard className="w-4 h-4 shrink-0" />}
          {label}
        </span>
      ) : (
        <>
          <Link 
            href={href} 
            className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
          >
            {isFirst && <LayoutDashboard className="w-4 h-4 shrink-0" />}
            {label}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline/50 shrink-0" />
        </>
      )}
    </div>
  )
}
