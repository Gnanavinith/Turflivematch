import React from 'react';
import Skeleton, { SkeletonCard, SkeletonText } from './Skeleton';

export default function PlayersSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-48 mt-1.5" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <SkeletonCard key={i} className="!p-4 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <SkeletonText className="!h-2.5 w-20" />
                <SkeletonText className="!h-2 w-12" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}