import React from 'react';
import Skeleton, { SkeletonCard, SkeletonText } from './Skeleton';

export default function TeamsSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3 w-44 mt-1.5" />
      </div>
      <SkeletonCard className="!rounded-3xl">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <SkeletonText className="!h-4 w-32" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
      </SkeletonCard>
      <SkeletonCard className="!rounded-3xl">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <SkeletonText className="!h-4 w-32" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
      </SkeletonCard>
      <SkeletonCard className="!rounded-3xl !p-4">
        <SkeletonText className="!h-2 w-32" />
        <SkeletonText className="!h-2 w-40" />
      </SkeletonCard>
    </div>
  );
}