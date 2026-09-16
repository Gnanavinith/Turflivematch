import React from 'react';
import Skeleton, { SkeletonCard, SkeletonText } from './Skeleton';

export default function ScorecardSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-6" />
        <SkeletonText className="!h-5 w-40" />
        <Skeleton className="h-6 w-6" />
      </div>
      <SkeletonCard className="!rounded-3xl !p-6 text-center space-y-2">
        <SkeletonText className="!h-4 w-44 mx-auto" />
        <Skeleton className="h-10 w-56 mx-auto rounded-lg" />
        <SkeletonText className="!h-3 w-28 mx-auto" />
      </SkeletonCard>
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard className="!p-4 text-center space-y-1.5">
          <SkeletonText className="!h-2 w-16 mx-auto" />
          <SkeletonText className="!h-5 w-14 mx-auto" />
        </SkeletonCard>
        <SkeletonCard className="!p-4 text-center space-y-1.5">
          <SkeletonText className="!h-2 w-16 mx-auto" />
          <SkeletonText className="!h-5 w-14 mx-auto" />
        </SkeletonCard>
      </div>
      <div className="flex rounded-xl bg-neutral-100 p-1">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg ml-1" />
      </div>
      <SkeletonCard className="!rounded-2xl !p-0 overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100">
          <SkeletonText className="!h-2 w-28" />
        </div>
        <div className="divide-y divide-neutral-100">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 space-y-1.5">
                <SkeletonText className="!h-3 w-28" />
                <SkeletonText className="!h-2 w-20" />
              </div>
              <SkeletonText className="!h-3 w-8" />
              <SkeletonText className="!h-3 w-8" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}