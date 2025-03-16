// const appInsights = require("applicationinsights");

// // Initialize App Insights before other imports
// appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
//     .setAutoCollectRequests(true)
//     .setAutoCollectPerformance(true)
//     .setAutoCollectExceptions(true)
//     .setAutoCollectDependencies(true)
//     .setSendLiveMetrics(true)
//     .start();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Azure CosmosDB with MongoDB API
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => console.log('Connected to Azure CosmosDB with MongoDB API'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER_NAME);

// Configure multer for memory storage (for blob uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Product Catalog API is running');
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    // Log a custom event for monitoring
    // appInsightsClient.trackEvent({ name: "Fetched all products", properties: { count: products.length } });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    // Log error details
    // appInsightsClient.trackException({ exception: error });
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get a specific product
app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // No need to construct imageUrl, it's already stored correctly
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});



// Upload image to Azure Blob Storage
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Generate correct unique blob name
        const blobName = `${uuidv4()}-${req.file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload file
        await blockBlobClient.upload(req.file.buffer, req.file.size, {
            blobHTTPHeaders: { blobContentType: req.file.mimetype }
        });

        // Correct Image URL
        const imageUrl = `https://productcatalogblobs.blob.core.windows.net/product-images/${blobName}`;

        console.log("✅ Uploaded Image:", { blobName, imageUrl });

        // Log successful upload event
        // appInsightsClient.trackEvent({ name: "Image Uploaded", properties: { blobName, imageUrl } });

        // Send the correct blobName and imageUrl
        res.json({ imageUrl, blobName });
    } catch (error) {
        console.error("❌ Error uploading image:", error);
        // appInsightsClient.trackException({ exception: error });
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});


// In server.js
app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, imageUrl, category } = req.body;
        console.log("🔍 Received imageUrl:", imageUrl);
        
        // No need to reconstruct the URL since we're getting the complete URL already
        const newProduct = new Product({
            name,
            description,
            price: parseFloat(price),
            imageUrl,   // Store the complete imageUrl
            category
        });
        const savedProduct = await newProduct.save();
        console.log("✅ Product Saved:", savedProduct);
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("❌ Error creating product:", error);
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
});


// Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, description, price, imageUrl, category } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        category,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If the product has an image, delete it from blob storage
    if (deletedProduct.imageUrl) {
      try {
        const blobName = deletedProduct.imageUrl.split('/').pop();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();
      } catch (blobError) {
        console.error('Error deleting image blob:', blobError);
        // Continue even if blob deletion fails
      }
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
