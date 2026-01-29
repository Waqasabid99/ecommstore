export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-300) rounded ${className}`}
      style={{
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  );
}

// Sidebar Skeleton Component
export function SidebarSkeleton() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-(--border-default) flex flex-col shadow-xl">
      {/* Header Skeleton */}
      <div className="h-20 flex items-center px-6 border-b border-(--border-default) bg-black">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Navigation Skeleton */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="space-y-1">
            <Skeleton className="h-12 w-full rounded-lg" />
            {/* Randomly show sub-items skeleton */}
            {index % 3 === 0 && (
              <div className="ml-4 space-y-1 pl-4">
                <Skeleton className="h-10 w-[calc(100%-1rem)] rounded-lg" />
                <Skeleton className="h-10 w-[calc(100%-1rem)] rounded-lg" />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Skeleton */}
      <div className="p-4 border-t border-(--border-default) bg-(--bg-surface)">
        <div className="flex items-center space-x-3 px-4 py-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </aside>
  );
}