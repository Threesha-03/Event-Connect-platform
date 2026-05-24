const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="skeleton-shimmer aspect-[16/9] w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton-shimmer h-4 w-3/4 rounded" />
      <div className="skeleton-shimmer h-4 w-1/2 rounded" />
      <div className="space-y-2">
        <div className="skeleton-shimmer h-3 w-full rounded" />
        <div className="skeleton-shimmer h-3 w-2/3 rounded" />
      </div>
      <div className="flex justify-between pt-2">
        <div className="skeleton-shimmer h-5 w-20 rounded" />
        <div className="skeleton-shimmer h-5 w-16 rounded" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
