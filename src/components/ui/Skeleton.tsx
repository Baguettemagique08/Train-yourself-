import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * A neutral shimmering placeholder block. Compose these to mirror the shape
 * of the content being loaded so layout doesn't shift on data arrival.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/50',
        className,
      )}
    />
  )
}
