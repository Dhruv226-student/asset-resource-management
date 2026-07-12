import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-100 dark:border-zinc-800 mb-6">
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mb-2">
            <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5" />
                {item.href ? (
                  <Link href={item.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-800 dark:text-zinc-200">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        {/* Title & Subtitle */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 md:text-3xl leading-8">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-gray-600 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>

      {/* Page Actions */}
      {actions && (
        <div className="flex items-center gap-3 mt-4 md:mt-0 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
