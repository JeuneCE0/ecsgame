export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-white/[0.05] rounded-lg" />
          <div className="h-4 w-64 bg-white/[0.03] rounded" />
        </div>
      </div>

      {/* Tab skeleton */}
      <div className="h-12 w-full rounded-xl bg-white/[0.03] border border-white/[0.05]" />

      {/* Quest card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 rounded-full bg-white/[0.05]" />
              <div className="h-5 w-14 rounded-full bg-white/[0.05]" />
            </div>
            <div className="h-5 w-3/4 bg-white/[0.05] rounded" />
            <div className="h-3 w-full bg-white/[0.03] rounded" />
            <div className="h-3 w-2/3 bg-white/[0.03] rounded" />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-12 bg-white/[0.03] rounded" />
                <div className="h-3 w-16 bg-white/[0.03] rounded" />
              </div>
              <div className="h-2 w-full bg-white/[0.06] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
