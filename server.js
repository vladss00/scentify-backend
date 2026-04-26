const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8100',
    'http://localhost:4200',
    'https://lighthearted-cendol-0ebe97.netlify.app',
    'https://classy-hamster-6a3b89.netlify.app'
  ]
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// In-memory storage
const products = [
  { id: 1, name: 'Bomb Scent', category: 'Fashion', price: 199, tag: 'NEW', img: 'assets/img/bomb.png', rating: 4, description: 'Bold and long-lasting fragrance for everyday confidence.', wishlist: false, notes: ['Citrus', 'Musk', 'Amber'], mood: 'Bold', scentProfile: 'Warm' },
  { id: 2, name: 'Alpha Scent', category: 'Fashion', price: 399, tag: 'HOT', img: 'assets/img/alpha.png', rating: 5, description: 'Strong masculine scent with a premium and modern aroma.', wishlist: false, notes: ['Woody', 'Spicy', 'Leather'], mood: 'Confident', scentProfile: 'Warm' },
  { id: 3, name: 'Bright Scent', category: 'Fashion', price: 99, tag: 'NEW', img: 'assets/img/bright.png', rating: 3, description: 'Light and fresh scent perfect for casual daily use.', wishlist: false, notes: ['Floral', 'Fruity', 'Green'], mood: 'Fresh', scentProfile: 'Fresh' },
  { id: 4, name: 'Chance Scent', category: 'Fashion', price: 199, tag: 'NEW', img: 'assets/img/chance.png', rating: 4, description: 'Sweet and elegant fragrance with a youthful vibe.', wishlist: false, notes: ['Floral', 'Fruity', 'Vanilla'], mood: 'Playful', scentProfile: 'Sweet' },
  { id: 5, name: 'Dolce Scent', category: 'Fashion', price: 499, tag: 'NEW', img: 'assets/img/dolce.png', rating: 5, description: 'Luxurious scent inspired by high-end designer perfumes.', wishlist: false, notes: ['Floral', 'Woody', 'Musk'], mood: 'Elegant', scentProfile: 'Floral' }
];

let cart = [];
let orders = [];

// ===== PRODUCTS =====

app.get('/products', (req, res) => {
  res.json({ success: true, data: products, count: products.length });
});

app.post('/products', (req, res) => {
  const { name, category, price, tag, img, rating, description, scentProfile } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }

  const newProduct = {
    id: Math.floor(Math.random() * 100000),
    name,
    category: category || 'Fashion',
    price,
    tag: tag || 'NEW',
    img: img || 'assets/img/default.png',
    rating: rating || 5,
    description,
    wishlist: false,
    scentProfile: scentProfile || 'Warm'
  };

  products.push(newProduct);
  res.json({ success: true, message: 'Product added successfully', data: newProduct });
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, description, tag, img, scentProfile } = req.body;
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (description) product.description = description;
  if (tag) product.tag = tag;
  if (img) product.img = img;
  if (scentProfile) product.scentProfile = scentProfile;

  res.json({ success: true, message: 'Product updated successfully', data: product });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const deletedProduct = products.splice(index, 1);
  res.json({ success: true, message: 'Product deleted successfully', data: deletedProduct[0] });
});

// ===== CART =====

app.get('/cart', (req, res) => {
  res.json({
    success: true,
    data: cart,
    count: cart.length,
    total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  });
});

app.post('/cart', (req, res) => {
  const { product, quantity } = req.body;

  if (!product || !quantity) {
    return res.status(400).json({ success: false, message: 'Product and quantity are required' });
  }

  const existingItem = cart.find(item => item.product.id === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }

  res.json({
    success: true,
    message: `${product.name} added to cart`,
    data: cart,
    total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  });
});

app.delete('/cart/:productId', (req, res) => {
  const { productId } = req.params;
  const initialLength = cart.length;
  cart = cart.filter(item => item.product.id !== parseInt(productId));

  if (cart.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Product not found in cart' });
  }

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: cart,
    total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  });
});

app.post('/cart/clear', (req, res) => {
  cart = [];
  res.json({ success: true, message: 'Cart cleared', data: cart });
});

// ===== ORDERS =====

app.get('/orders', (req, res) => {
  res.json({ success: true, data: orders, count: orders.length });
});

app.post('/orders', (req, res) => {
  const { customerName, address, contact, items, deliveryService, total, status } = req.body;

  if (!customerName || !items || !total) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const newOrder = {
    id: 'ORD-' + Math.floor(Math.random() * 10000),
    customerName,
    address,
    contact,
    items,
    deliveryService,
    total,
    status: status || 'Pending',
    date: new Date()
  };

  orders.unshift(newOrder);
  res.json({ success: true, message: 'Order placed successfully', data: newOrder });
});

app.put('/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  res.json({ success: true, data: order });
});

// ===== ERROR HANDLING =====

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`✅ Scentify Backend API running on http://localhost:${PORT}`);
  console.log(`📦 GET http://localhost:${PORT}/products`);
  console.log(`🛒 GET http://localhost:${PORT}/cart`);
  console.log(`📋 GET http://localhost:${PORT}/orders`);
});