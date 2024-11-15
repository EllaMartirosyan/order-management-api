const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const NodeCache = require('node-cache');
const mongoose = require('mongoose');
const { Order } = require('./models');

const PORT = process.env.PORT || 5000;
const app = express();

// Cache configuration
const photoCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const PIXABAY_API_KEY = '45640711-3b2c9c3e0dd9ac6e6a5b798be';
const PIXABAY_API_URL = 'https://pixabay.com/api/';

app.use(bodyParser.json());

// Mongoose connection
mongoose.connect('mongodb://localhost:27017/ordersDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Photos API
app.get("/api/photos/:N", async (req, res) => {
  const { N } = req.params;
  const numPhotos = parseInt(N, 10);

  // Validate N
  if (isNaN(numPhotos) || numPhotos < 1) {
      return res.status(400).json({ error: "Param must be a positive integer" });
  }

  // Check cache for existing photo URLs
  const cacheKey = `photos_${numPhotos}`;
  const cachedPhotos = photoCache.get(cacheKey);
  if (cachedPhotos) {
      return res.json({ data: cachedPhotos });
  }

  try {
    // Fetch photos from Pixabay API
    const response = await axios.get(PIXABAY_API_URL, {
      params: {
        key: PIXABAY_API_KEY,
        per_page: numPhotos,
        image_type: 'photo',
      },
    });

    // Extract photo URLs from the response
    const photoUrls = response.data.hits.map(hit => hit.webformatURL);

    // Cache the photo URLs
    photoCache.set(cacheKey, photoUrls);

    // Respond with the photo URLs
    res.json({ data: photoUrls });
  } catch (error) {
    console.error('Error fetching data from Pixabay:', error);
    res.status(500).json({ error: "Failed to fetch photos from Pixabay." });
  }
});

// Create order API
app.post('/api/orders', async (req, res) => {
  const { email, fullName, fullAddress, images, frameColor, user } = req.body;

  // Validate order
  if (!email || !fullName || !fullAddress || !images || !frameColor || !user) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Save and return created order
    const newOrder = new Order({ email, fullName, fullAddress, images, frameColor, user });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
  }
});

// Get User orders API
app.get('/api/orders/:user', async (req, res) => {
  const { user } = req.params;

  try {
    // Find all user's orders
    const userOrders = await Order.find({ user });
    if (userOrders.length === 0) {
        return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json(userOrders);
  } catch (error) {
      res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`);})