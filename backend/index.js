const express = require('express');
const app = express();
const fs = require('fs');

// Allow cross-origin requests (CORS)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const PORT = 3001;

let products = [];

try {
  const data = fs.readFileSync('products.json', 'utf8');
  products = JSON.parse(data);
  console.log('Products loaded from products.json:', products);
} catch (error) {
  console.error('Error reading products.json:', error);
}

// Serve images from the 'images' folder
app.use('/images', express.static('images'));

app.get('/products', (req, res) => {
  try {
    const rawProducts = fs.readFileSync('./products.json', 'utf8');
    const products = JSON.parse(rawProducts);
    res.json(products);
  } catch (error) {
    console.error('Error reading products.json:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});