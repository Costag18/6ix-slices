export function SkeletonCard() {
  return (
    <div className="bg-[var(--color-card)] rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      {/* Rank + chain name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="h-5 bg-gray-200 rounded w-32" />
      </div>
      {/* Description placeholder */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
      {/* Price placeholder */}
      <div className="flex justify-between items-end">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}
