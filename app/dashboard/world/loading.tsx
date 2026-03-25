export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-white/[0.05] rounded-lg" />
          <div className="h-4 w-64 bg-white/[0.03] rounded" />
        </div>
      </div>

      {/* Map area skeleton */}
      <div
        className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02]"
        style={{ height: 400 }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="font-pixel text-[10px] text-white/20">
            Chargement du monde...
          </div>
        </div>
      </div>

      {/* Controls skeleton */}
      <div className="h-10 w-full rounded-xl bg-white/[0.03] border border-white/[0.05]" />
    </div>
  );
}
