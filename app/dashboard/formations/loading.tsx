export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
        <div className="space-y-2">
          <div className="h-7 w-40 bg-white/[0.05] rounded-lg" />
          <div className="h-4 w-56 bg-white/[0.03] rounded" />
        </div>
      </div>

      {/* Formation card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.05] bg-white/[0.03] overflow-hidden"
          >
            {/* Thumbnail placeholder */}
            <div className="h-40 bg-white/[0.05]" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 bg-white/[0.05] rounded" />
              <div className="h-3 w-full bg-white/[0.03] rounded" />
              <div className="h-3 w-2/3 bg-white/[0.03] rounded" />
              <div className="flex items-center justify-between mt-4">
                <div className="h-4 w-20 bg-white/[0.05] rounded" />
                <div className="h-4 w-16 bg-white/[0.05] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
