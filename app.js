require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));[]

// Import router dari folder routes
const indexRouter = require('./routes/index');
const authRoutes = require('./routes/auth');

// Gunakan router
app.use('/', authRoutes);
app.use('/', indexRouter);

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
