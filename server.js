require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const insumoRoutes = require('./routes/insumos');
const movementRoutes = require('./routes/movements');
const activityRoutes = require('./routes/activities');

const app = express();
app.use(cors());
app.use(express.json());

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

// ruta salud
app.get('/', (req, res) => res.send('API Cafe Galeria - backend operativo'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
