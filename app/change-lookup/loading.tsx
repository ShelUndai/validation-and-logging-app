export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded ml-4" />
      </header>
      <main className="flex-1 grid grid-rows-[auto_1fr] gap-4 p-4 md:gap-6 md:p-6 overflow-hidden">
        {/* Help Section Skeleton */}
        <div className="h-16 bg-blue-50 border border-blue-200 animate-pulse rounded-lg" />

        {/* Input Section Skeleton */}
        <div className="h-32 bg-muted animate-pulse rounded-lg" />

        {/* Results Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          <div className="h-full bg-muted animate-pulse rounded-lg" />
          <div className="h-full bg-muted animate-pulse rounded-lg" />
        </div>
      </main>
    </div>
  )
}
