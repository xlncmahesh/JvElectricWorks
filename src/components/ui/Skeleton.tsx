export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="w-full h-44 rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}
