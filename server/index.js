const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path')


dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors({
  origin: [
    'http://localhost:5173',            // your Vite dev server
    'https://furniture-shop-jet.vercel.app/' // your deployed front‑end
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));




// Health Check Route
/* app.use(express.static(path.join(__dirname, "dist")));
 */
// Catch-all route to serve index.html (for React Router)
/* app.get("", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
}); */

/* if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} */



app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/ProductRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/', require('./routes/purchaseRoutes'));
app.use('/api/category', require('./routes/categoryRoutes'));
app.use('/api/carousel', require('./routes/carouselRoutes'));



// Server Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
