const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the User Service!</h1><p>You are viewing the User App.</p>');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'user-service' });
});

app.get('/users', (req, res) => {
  res.status(200).json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});

app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
});
