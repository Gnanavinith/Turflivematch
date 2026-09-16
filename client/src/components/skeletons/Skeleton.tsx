import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-neutral-200/70', className)} style={style} />
  );
}

/* ── Reusable blocks ── */

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-3 rounded-full', className)} />;
}

export function SkeletonCircle({ size = 32, className, style }: SkeletonProps & { size?: number }) {
  return <Skeleton className={cn('rounded-full flex-shrink-0', className)} style={{ width: size, height: size, ...style }} />;
}

interface SkeletonCardProps extends SkeletonProps {
  children?: React.ReactNode;
  key?: React.Key;
}

export function SkeletonCard({ className, children }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-2xl border border-neutral-100 bg-white p-5 space-y-4', className)}>
      {children}
    </div>
  );
}

export default Skeleton;