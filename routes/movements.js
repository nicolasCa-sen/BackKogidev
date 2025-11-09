const express = require('express');
const router = express.Router();
const movementCtrl = require('../controllers/movementController');
const { authenticate, permit } = require('../middleware/auth');

router.post('/', authenticate, permit('admin','empleado'), movementCtrl.createMovement);
router.get('/', authenticate, permit('admin','empleado'), movementCtrl.getMovements);

module.exports = router;
