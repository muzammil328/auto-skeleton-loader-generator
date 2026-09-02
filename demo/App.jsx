import React from 'react';
import UserCardSkeleton from '../samples/UserCard.skeleton.jsx';
import ProductListSkeleton from '../samples/ProductList.skeleton.jsx';
import ArticlePreviewSkeleton from '../samples/ArticlePreview.skeleton.jsx';

const samples = [
  { name: 'UserCard', Component: UserCardSkeleton, source: 'samples/UserCard.jsx' },
  { name: 'ProductList', Component: ProductListSkeleton, source: 'samples/ProductList.jsx' },
  { name: 'ArticlePreview', Component: ArticlePreviewSkeleton, source: 'samples/ArticlePreview.jsx' },
];

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <h1>Auto Skeleton — Sample Preview</h1>
        <p>Generated skeletons using plain CSS (pulse animation). No Tailwind required.</p>
      </header>

      <div className="grid">
        {samples.map(({ name, Component, source }) => (
          <section key={name} className="card">
            <div className="card-header">
              <h2>{name}</h2>
              <code>{source}</code>
            </div>
            <div className="preview">
              <Component />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
