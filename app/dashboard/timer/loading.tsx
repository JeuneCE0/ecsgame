export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
        <div className="space-y-2">
          <div className="h-7 w-24 bg-white/[0.05] rounded-lg" />
          <div className="h-4 w-56 bg-white/[0.03] rounded" />
        </div>
      </div>

      {/* Mode selector skeleton */}
      <div className="h-12 w-full rounded-xl bg-white/[0.03] border border-white/[0.05]" />

      {/* Timer circle skeleton */}
      <div className="flex justify-center">
        <div className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-white/[0.03] border border-white/[0.05]" />
      </div>

      {/* Controls skeleton */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-12 w-36 rounded-xl bg-white/[0.05]" />
        <div className="h-12 w-28 rounded-xl bg-white/[0.03] border border-white/[0.05]" />
      </div>

      {/* Notes skeleton */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-5 space-y-3">
        <div className="h-4 w-28 bg-white/[0.05] rounded" />
        <div className="h-20 w-full bg-white/[0.05] rounded-xl" />
      </div>

      {/* Sessions skeleton */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-5 space-y-4">
        <div className="h-5 w-36 bg-white/[0.05] rounded" />
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/[0.05]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 bg-white/[0.05] rounded" />
                <div className="h-3 w-24 bg-white/[0.03] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
