const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Order Service!</h1><p>You are viewing the Order App.</p>');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'order-service' });
});

app.get('/orders', (req, res) => {
  res.status(200).json([
    { id: 1001, userId: 1, productId: 101, status: 'Shipped' },
    { id: 1002, userId: 2, productId: 102, status: 'Processing' }
  ]);
});

app.listen(port, () => {
  console.log(`Order Service running on port ${port}`);
});
