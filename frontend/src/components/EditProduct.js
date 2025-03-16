// src/components/EditProduct.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
        const product = response.data;
        
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setCategory(product.category || '');
        setCurrentImageUrl(product.imageUrl || '');
        setLoading(false);
      } catch (err) {
        setError('Error fetching product details. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProduct();
  }, [id]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      let imageUrl = currentImageUrl;
      
      // If new image is selected, upload it first
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const uploadResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        imageUrl = uploadResponse.data.imageUrl;
      }
      
      // Update the product
      await axios.put(`${process.env.REACT_APP_API_URL}/api/products/${id}`, {
        name,
        description,
        price,
        category,
        imageUrl
      });
      
      navigate(`/products/${id}`);
    } catch (err) {
      setError('Error updating product. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;

  return (
    <div className="row">
      <div className="col-md-8 offset-md-2">
        <h2 className="mb-4">Edit Product</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Product Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="mb-3">
            <label htmlFor="price" className="form-label">Price</label>
            <div className="input-group">
              <span className="input-group-text">₹</span>
              <input
                type="number"
                className="form-control"
                id="price"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="category" className="form-label">Category</label>
            <input
              type="text"
              className="form-control"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Current Image</label>
            {currentImageUrl ? (
              <div className="border p-2 mb-2">
                <img
                  src={currentImageUrl}
                  alt="Current"
                  className="img-fluid"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            ) : (
              <p className="text-muted">No image currently set</p>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor="image" className="form-label">Change Image (optional)</label>
            <input
              type="file"
              className="form-control"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          
          {imagePreview && (
            <div className="mb-3">
              <label className="form-label">New Image Preview</label>
              <div className="border p-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="img-fluid"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            </div>
          )}
          
          <div className="mb-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Update Product'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => navigate(`/products/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;