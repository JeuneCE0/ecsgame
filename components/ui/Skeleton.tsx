import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-white/[0.05]', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-full mt-4" />
    </div>
  );
}
