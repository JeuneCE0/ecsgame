export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Profile header skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/[0.05]" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-7 w-48 bg-white/[0.05] rounded-lg mx-auto md:mx-0" />
            <div className="h-4 w-32 bg-white/[0.03] rounded mx-auto md:mx-0" />
            <div className="flex gap-3 justify-center md:justify-start">
              <div className="h-6 w-20 rounded-full bg-white/[0.05]" />
              <div className="h-6 w-24 rounded-full bg-white/[0.05]" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-4 space-y-2">
            <div className="h-6 w-12 bg-white/[0.05] rounded mx-auto" />
            <div className="h-3 w-20 bg-white/[0.03] rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* XP progress skeleton */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
        <div className="h-5 w-32 bg-white/[0.05] rounded" />
        <div className="h-3 w-full bg-white/[0.06] rounded-full" />
      </div>

      {/* Badges skeleton */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
        <div className="h-5 w-24 bg-white/[0.05] rounded" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/[0.05]" />
          ))}
        </div>
      </div>

      {/* Activity skeleton */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-3">
        <div className="h-5 w-36 bg-white/[0.05] rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="w-9 h-9 rounded-lg bg-white/[0.05]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 bg-white/[0.05] rounded" />
              <div className="h-3 w-24 bg-white/[0.03] rounded" />
            </div>
            <div className="h-5 w-16 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
