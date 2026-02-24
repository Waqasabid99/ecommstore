'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const pathname = usePathname();

  const segments = pathname
    .split('/')
    .filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return { href, label };
  });

  // Don't show breadcrumbs on homepage
  if (segments.length === 0 || pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/reset-password' || pathname === '/forgot-password' || pathname === '/auth' ) return null;

  return (
    <nav aria-label="Breadcrumb" className="mx-4 mb-6">
      <div className="bg-white border border-(--border-default) rounded-xl px-4 py-3">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li>
            <Link 
              href="/" 
              className="flex items-center gap-1.5 text-(--text-secondary) hover:text-(--color-brand-primary) transition-colors font-medium"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>

          {crumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-2">
              <ChevronRight size={16} className="text-(--text-secondary)" />
              {i === crumbs.length - 1 ? (
                <span className="text-(--text-heading) font-semibold">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-(--text-secondary) hover:text-(--color-brand-primary) transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;