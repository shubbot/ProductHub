import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function AddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let imageUrl = '';
      
      // If image is selected, upload it first
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const uploadResponse = await axios.post(
          `https://producthub-g8a3eac3c9bcasfx.southindia-01.azurewebsites.net/api/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        imageUrl = uploadResponse.data.imageUrl;
      }
      
      // Create the product
      await axios.post(`https://producthub-g8a3eac3c9bcasfx.southindia-01.azurewebsites.net/api/products`, {
        name,
        description,
        price,
        category,
        imageUrl
      });
      
      navigate('/');
    } catch (err) {
      setError('Error creating product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-md-8 offset-md-2">
        <h2 className="mb-4">Add New Product</h2>
        
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
              <span className="input-group-text"> INR (₹)</span>
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
            <label htmlFor="image" className="form-label">Product Image</label>
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
              <label className="form-label">Image Preview</label>
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;