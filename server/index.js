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
const corsOptions = {
  origin: ['http://localhost:5173','https://furniture-shop-jet.vercel.app','https://furniture-shop-dvh6.vercel.app','https://spotfurnishrental.vercel.app'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

//app.use(cors(corsOptions));
app.use(cors())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// if you need to handle preflights for all routes





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
app.use('/api', require('./routes/purchaseRoutes'));
app.use('/api/category', require('./routes/categoryRoutes'));
app.use('/api/carousel', require('./routes/carouselRoutes'));
app.use('/api/cities', require('./routes/locationRoutes'));



// Server Port
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
