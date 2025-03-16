// src/components/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("API URL:", 'https://producthub-g8a3eac3c9bcasfx.southindia-01.azurewebsites.net'); // Debugging API URL
        const response = await axios.get(`https://producthub-g8a3eac3c9bcasfx.southindia-01.azurewebsites.net/api/products/${id}`);
        
        console.log("Fetched Product:", response.data);  // Debug: See full response in console
  
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching product details. Please try again later.');
        setLoading(false);
        console.error("API Error:", err);
      }
    };
  
    fetchProduct();
  }, [id]);
  


  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  
  if (error) return <div className="alert alert-danger">{error}</div>;
  
  if (!product) return <div className="alert alert-warning">Product not found.</div>;

  console.log("Image URL:", product.imageUrl);

  return (
    <div className="row">
      <div className="col-md-6">
      {product.imageUrl ? (
  <>
    <img 
      src={product.imageUrl} 
      alt={product.name} 
      className="img-fluid rounded"
    />
  </>
) : (
  <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '300px' }}>
    <span className="text-muted">No image</span>
  </div>
)}

      </div>
      
      <div className="col-md-6">
        <h2>{product.name}</h2>
        
        <p className="text-muted">
          Category: {product.category || 'Uncategorized'}
        </p>
        
        <h4 className="text-primary">₹{product.price.toFixed(2)}</h4>
        
        <div className="mb-4">
          <h5>Description</h5>
          <p>{product.description}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-muted">
            <small>Added on: {new Date(product.createdAt).toLocaleDateString()}</small>
            {product.updatedAt && product.updatedAt !== product.createdAt && (
              <small> | Last updated: {new Date(product.updatedAt).toLocaleDateString()}</small>
            )}
          </p>
        </div>
        
        <div>
          <Link to="/" className="btn btn-secondary me-2">Back to Products</Link>
          <Link to={`/edit-product/${product._id}`} className="btn btn-warning me-2">Edit</Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;