import React from 'react';
import Skeleton, { SkeletonCard, SkeletonText } from './Skeleton';

export default function LiveScoringSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <SkeletonText className="!h-4 w-24" />
        <SkeletonText className="!h-3 w-20" />
      </div>
      <SkeletonText className="!h-5 w-64 mx-auto !rounded-lg" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard className="!rounded-2xl !p-4 text-center space-y-2">
          <SkeletonText className="!h-2 w-20 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto rounded-lg" />
          <SkeletonText className="!h-2 w-14 mx-auto" />
        </SkeletonCard>
        <SkeletonCard className="!rounded-2xl !p-4 text-center space-y-2">
          <SkeletonText className="!h-2 w-20 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto rounded-lg" />
          <SkeletonText className="!h-2 w-14 mx-auto" />
        </SkeletonCard>
      </div>
      <SkeletonCard className="!rounded-2xl">
        <SkeletonText className="!h-2 w-20" />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <SkeletonText className="!h-3 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <SkeletonText className="!h-3 w-16" />
          </div>
        </div>
      </SkeletonCard>
      <SkeletonCard className="!rounded-2xl">
        <SkeletonText className="!h-2 w-24" />
        <div className="grid grid-cols-4 gap-2 mt-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </SkeletonCard>
    </div>
  );
}