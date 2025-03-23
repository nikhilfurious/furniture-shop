import React, { useEffect, useState } from 'react'
import { fetchProducts } from '../services/Productapi';

function Demo() {
const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();
        /* const  = await res.data; */
        setProducts(fetchedProducts);
        

        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
        <h1>Products</h1>
        {loading ? (
            <p>Loading...</p>
        ) : (
            <ul>
            {products.map((product) => (
                <li key={product._id}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Price: {product.basePrice}</p>
                  {product.images && <img src={product.images[0]} alt={product.name} />}
                </li>
            ))}
            </ul>
        )}
    </div>
  )
}

export default Demo