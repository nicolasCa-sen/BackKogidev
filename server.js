require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const insumoRoutes = require('./routes/insumos');
const movementRoutes = require('./routes/movements');
const activityRoutes = require('./routes/activities');
const salesRoutes = require('./routes/sales');
const productsRoutes = require('./routes/products');
const ceramicsRoutes = require('./routes/ceramics');

const app = express();
app.use(cors());

// Aumentamos el límite para aceptar imágenes en Base64
app.use(express.json({ limit: '10mb' })); // antes solo era express.json()
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// conectarse a Mongo
connectDB(process.env.MONGO_URI).catch(err => {
  console.error('Could not connect to DB', err);
  process.exit(1);
});

// rutas
app.use('/api/auth', authRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/ceramics', ceramicsRoutes);

// ruta salud
app.get('/', (req, res) => res.send('API Cafe Galeria - backend operativo'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
