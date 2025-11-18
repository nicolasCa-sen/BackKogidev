require('dotenv').config();
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const connectDB = require('../config/db');

const authRoutes = require('../routes/auth');
const insumoRoutes = require('../routes/insumos');
const movementRoutes = require('../routes/movements');
const activityRoutes = require('../routes/activities');
const salesRoutes = require('../routes/sales');
const productsRoutes = require('../routes/products');
const ceramicsRoutes = require('../routes/ceramics');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

connectDB(process.env.MONGO_URI).catch(console.error);

app.use('/api/auth', authRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/ceramics', ceramicsRoutes);

app.get('/', (req, res) => {
  res.send('API Cafe Galería - Backend operativo');
});

module.exports = serverless(app);