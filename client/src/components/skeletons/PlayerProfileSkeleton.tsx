import React from 'react';
import Skeleton, { SkeletonCard, SkeletonText } from './Skeleton';

export default function PlayerProfileSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-24" />
      </div>
      <SkeletonCard className="!rounded-3xl !p-6 text-center space-y-3">
        <Skeleton className="mx-auto h-20 w-20 rounded-full" />
        <SkeletonText className="!h-5 w-32 mx-auto" />
        <SkeletonText className="!h-3 w-20 mx-auto" />
      </SkeletonCard>
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <SkeletonCard key={i} className="!p-3 text-center space-y-1.5">
            <SkeletonText className="!h-2 w-10 mx-auto" />
            <SkeletonText className="!h-4 w-8 mx-auto" />
          </SkeletonCard>
        ))}
      </div>
      <SkeletonCard className="!rounded-2xl">
        <SkeletonText className="!h-2 w-28" />
        <div className="space-y-2 mt-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between gap-3">
              <SkeletonText className="!h-3 w-32" />
              <SkeletonText className="!h-3 w-16" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}