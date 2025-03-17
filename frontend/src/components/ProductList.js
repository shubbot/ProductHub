import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`https://producthub-g8a3eac3c9bcasfx.southindia-01.azurewebsites.net/api/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching products. Please try again later.');
      setLoading(false);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`https://producthub-g8a3eac3c9bcasfx.southindia-01.azurewebsites.net/api/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
      } catch (err) {
        setError('Error deleting product. Please try again later.');
        console.error(err);
      }
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === 'price') {
      return a.price - b.price; 
    } else if (sortOption === 'price_desc') {
      return b.price - a.price;
    } else if (sortOption === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt); 
    } else if (sortOption === 'date_desc') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0; 
  });

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2 className="mb-4">Product Catalog</h2>

      <div className="mb-3">
        <label className="me-2"><strong>Sort By:</strong></label>
        <select className="form-select d-inline-block w-auto"
          onChange={handleSortChange}
          value={sortOption}
        >
          <option value="">None</option>
          <option value="price">Price (Low to High)</option>
          <option value="price_desc">Price (High to Low)</option>
          <option value="date">Newest First</option>
          <option value="date_desc">Oldest First</option>
        </select>
      </div>

      <Link to="/add-product" className="btn btn-primary mb-4">Add New Product</Link>
      
      {sortedProducts.length === 0 ? (
        <div className="alert alert-info">No products found. Add your first product!</div>
      ) : (
        <div className="row">
          {sortedProducts.map(product => (
            <div key={product._id} className="col-md-4 mb-4">
              <div className="card h-100">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="card-img-top" 
                    style={{height: '200px', objectFit: 'cover'}}
                  />
                ) : (
                  <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: '200px'}}>
                    <span className="text-muted">No image</span>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.description.substring(0, 100)}...</p>
                  <p className="card-text"><strong>₹{product.price.toFixed(2)}</strong></p>
                  {product.category && (
                    <p className="card-text"><small className="text-muted">Category: {product.category}</small></p>
                  )}
                  <p className="card-text"><small className="text-muted">Uploaded: {new Date(product.createdAt).toLocaleDateString()}</small></p>
                </div>
                <div className="card-footer bg-transparent">
                  <Link to={`/products/${product._id}`} className="btn btn-info btn-sm me-2">View</Link>
                  <Link to={`/edit-product/${product._id}`} className="btn btn-warning btn-sm me-2">Edit</Link>
                  <button 
                    onClick={() => handleDelete(product._id)} 
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;

