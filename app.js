const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send("Service 1 Running");
});

app.listen(3000, () => console.log("Running"));