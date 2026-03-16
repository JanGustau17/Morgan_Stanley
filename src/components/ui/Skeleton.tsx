'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gray-200',
        className,
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0cc] p-5 flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-gray-100 h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2 opacity-30">🗺️</div>
        <div className="text-sm text-gray-400">Loading map…</div>
      </div>
    </div>
  );
}
