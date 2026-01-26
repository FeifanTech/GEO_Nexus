import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  )
}

// Card Skeleton
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 bg-white rounded-lg border border-slate-200", className)}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

// Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

// Table Skeleton
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 p-3 bg-slate-50 rounded">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-slate-100">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )
}

// List Item Skeleton
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  )
}

// Page Skeleton
function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      
      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton className="h-80" />
        <CardSkeleton className="h-80" />
      </div>
    </div>
  )
}

// Chart Skeleton
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200">
      <Skeleton className="h-4 w-32 mb-4" />
      <div 
        className="flex items-end justify-around gap-2"
        style={{ height }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-8 rounded-t"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  CardSkeleton, 
  StatsCardSkeleton, 
  TableSkeleton, 
  ListItemSkeleton,
  PageSkeleton,
  ChartSkeleton,
}
