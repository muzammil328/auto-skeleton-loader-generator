import React from 'react';

export default function ArticlePreview({ article }) {
  return (
    <article>
      <header>
        <h1>{article.title}</h1>
        <span>{article.date}</span>
      </header>
      <img src={article.cover} alt="" />
      <p>{article.excerpt}</p>
      <button>Read More</button>
    </article>
  );
}
