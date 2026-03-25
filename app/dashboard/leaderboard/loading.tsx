export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
        <div className="space-y-2">
          <div className="h-7 w-40 bg-white/[0.05] rounded-lg" />
          <div className="h-4 w-64 bg-white/[0.03] rounded" />
        </div>
      </div>

      {/* Tab skeleton */}
      <div className="h-12 w-full rounded-xl bg-white/[0.03] border border-white/[0.05]" />

      {/* Podium skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-2xl bg-white/[0.03] border border-white/[0.05] p-6 ${
              i === 0 ? 'order-2' : i === 1 ? 'order-1 mt-4' : 'order-3 mt-4'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/[0.05]" />
              <div className="w-16 h-16 rounded-full bg-white/[0.05]" />
              <div className="h-4 w-20 rounded bg-white/[0.05]" />
              <div className="h-5 w-12 rounded-full bg-white/[0.05]" />
              <div className="h-6 w-16 rounded bg-white/[0.05]" />
            </div>
          </div>
        ))}
      </div>

      {/* Row skeletons */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-4 p-4"
          >
            <div className="w-8 h-8 rounded-full bg-white/[0.05]" />
            <div className="w-10 h-10 rounded-full bg-white/[0.05]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-white/[0.05]" />
              <div className="h-3 w-20 rounded bg-white/[0.03]" />
            </div>
            <div className="h-4 w-16 rounded bg-white/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}
