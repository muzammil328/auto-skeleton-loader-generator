import React from 'react';

export function ProductList({ products }) {
  return (
    <section className="product-list">
      <h2>Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <img src={product.image} alt={product.name} />
            <div>
              <h4>{product.name}</h4>
              <p>{product.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
