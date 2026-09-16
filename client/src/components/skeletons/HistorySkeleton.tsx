import React from 'react';
import Skeleton, { SkeletonCard, SkeletonText } from './Skeleton';

export default function HistorySkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-56 mt-1.5" />
      </div>
      <SkeletonCard className="!rounded-2xl">
        <div className="flex items-center justify-between">
          <SkeletonText className="!h-2 w-20" />
          <SkeletonText className="!h-2 w-14" />
        </div>
        <SkeletonText className="!h-4 w-48 mt-1" />
        <SkeletonText className="!h-3 w-24" />
        <div className="flex justify-between items-center mt-2">
          <SkeletonText className="!h-3 w-36" />
          <SkeletonText className="!h-3 w-12" />
        </div>
      </SkeletonCard>
      <SkeletonCard className="!rounded-2xl">
        <div className="flex items-center justify-between">
          <SkeletonText className="!h-2 w-24" />
          <SkeletonText className="!h-2 w-14" />
        </div>
        <SkeletonText className="!h-4 w-40 mt-1" />
        <SkeletonText className="!h-3 w-28" />
        <div className="flex justify-between items-center mt-2">
          <SkeletonText className="!h-3 w-32" />
          <SkeletonText className="!h-3 w-12" />
        </div>
      </SkeletonCard>
      <SkeletonCard className="!rounded-2xl">
        <SkeletonText className="!h-4 w-44 mx-auto" />
      </SkeletonCard>
    </div>
  );
}