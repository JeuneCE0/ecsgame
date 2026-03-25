export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-pulse">
      {/* Hero section skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 md:p-8 space-y-6">
        <div className="h-10 w-64 bg-white/[0.05] rounded-lg" />
        <div className="h-4 w-48 bg-white/[0.03] rounded-lg" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/[0.05]" />
              <div className="space-y-1.5">
                <div className="h-4 w-20 bg-white/[0.05] rounded" />
                <div className="h-3 w-28 bg-white/[0.03] rounded" />
              </div>
            </div>
            <div className="h-4 w-10 bg-white/[0.05] rounded" />
          </div>
          <div className="h-3 w-full bg-white/[0.06] rounded-full" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/[0.05]" />
              <div className="space-y-2">
                <div className="h-6 w-16 bg-white/[0.05] rounded" />
                <div className="h-3 w-24 bg-white/[0.03] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-6 w-32 bg-white/[0.05] rounded-lg" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-white/[0.05] bg-white/[0.03]"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-28 bg-white/[0.05] rounded-lg" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-white/[0.05] bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
