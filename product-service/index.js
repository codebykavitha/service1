const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Product Service!</h1><p>You are viewing the Product App.</p>');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'product-service' });
});

app.get('/products', (req, res) => {
  res.status(200).json([
    { id: 101, name: 'Laptop', price: 999.99 },
    { id: 102, name: 'Phone', price: 499.99 }
  ]);
});

app.listen(port, () => {
  console.log(`Product Service running on port ${port}`);
});
