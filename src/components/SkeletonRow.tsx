export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <span className="skeleton-num" />
      <div className="skeleton-body">
        <span className="skeleton-title" />
        <span className="skeleton-meta" />
      </div>
      <span className="skeleton-date" />
      <span className="skeleton-price" />
    </div>
  )
}
