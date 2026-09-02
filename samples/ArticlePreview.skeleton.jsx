import React from 'react';

const skeletonStyles = `.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}
.skeleton-circle {
  border-radius: 50%;
}
.skeleton-line {
  border-radius: 4px;
  margin-bottom: 8px;
}
.skeleton-rectangle {
  border-radius: 8px;
}
.skeleton-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`;

export function ArticlePreviewSkeleton() {
  return (
    <>
      <style>{skeletonStyles}</style>
    <div className="skeleton-block">
      <div className="skeleton-block">
        <div className="skeleton skeleton-line" style={{ width: '100%', height: '32px' }} />
        <div className="skeleton skeleton-line" style={{ width: '100%', height: '16px' }} />
      </div>
      <div className="skeleton skeleton-rectangle" style={{ width: '100%', height: '120px' }} />
      <div className="skeleton skeleton-line" style={{ width: '100%', height: '16px' }} />
      <div className="skeleton skeleton-rectangle" style={{ width: '100px', height: '36px' }} />
    </div>
    </>
  );
}

export default ArticlePreviewSkeleton;
