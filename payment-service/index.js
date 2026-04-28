const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

app.get('/', (req, res) => {
    res.send('Welcome to the Payment Service!');
});

app.get('/payments', (req, res) => {
    res.json([{ id: 1, amount: 250, status: "Paid" }, { id: 2, amount: 99, status: "Pending" }]);
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
});
