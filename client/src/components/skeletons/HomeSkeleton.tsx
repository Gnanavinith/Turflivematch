import React from 'react';
import Skeleton, { SkeletonCard, SkeletonText } from './Skeleton';

export default function HomeSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero banner */}
      <SkeletonCard className="!bg-neutral-900 !border-neutral-800 !p-8 !rounded-3xl">
        <Skeleton className="h-5 w-28 rounded-full bg-neutral-700" />
        <Skeleton className="h-8 w-64 rounded-xl bg-neutral-700 mt-3" />
        <Skeleton className="h-8 w-28 rounded-xl bg-emerald-600 mt-6" />
      </SkeletonCard>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <SkeletonCard key={i} className="!p-4 text-center space-y-2">
            <Skeleton className="mx-auto h-8 w-8 rounded-lg" />
            <SkeletonText className="!h-5 w-10 mx-auto" />
            <SkeletonText className="!h-2 w-12 mx-auto" />
          </SkeletonCard>
        ))}
      </div>

      {/* Live matches placeholder */}
      <SkeletonCard className="!rounded-3xl">
        <SkeletonText className="!h-2 w-24" />
        <Skeleton className="h-24 w-full rounded-2xl bg-neutral-200/50 mt-3" />
      </SkeletonCard>

      {/* Recent matches */}
      <SkeletonCard className="!rounded-2xl">
        <SkeletonText className="!h-2 w-32" />
        <SkeletonText className="!h-12 w-full mt-2" />
      </SkeletonCard>
    </div>
  );
}