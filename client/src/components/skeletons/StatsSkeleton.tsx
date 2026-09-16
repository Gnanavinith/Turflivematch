import React from 'react';
import Skeleton, { SkeletonCard, SkeletonText } from './Skeleton';

export default function StatsSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-3 w-52 mt-1.5" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map(i => (
          <SkeletonCard key={i} className="!p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <SkeletonText className="!h-2 w-14" />
            </div>
            <Skeleton className="h-8 w-full" />
          </SkeletonCard>
        ))}
      </div>
      <SkeletonCard className="!rounded-3xl">
        <SkeletonText className="!h-2 w-24" />
        <div className="space-y-2 mt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <SkeletonText className="!h-2.5 w-24 flex-1" />
              <SkeletonText className="!h-2 w-10" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}