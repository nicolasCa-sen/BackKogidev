const express = require('express');
const router = express.Router();
const insumoCtrl = require('../controllers/insumoController');
const { authenticate, permit } = require('../middleware/auth');

router.post('/', authenticate, permit('admin','empleado'), insumoCtrl.createInsumo);
router.get('/', authenticate, insumoCtrl.getAll);
router.get('/:id', authenticate, insumoCtrl.getById);
router.put('/:id', authenticate, permit('admin','empleado'), insumoCtrl.updateInsumo);
router.delete('/:id', authenticate, permit('admin'), insumoCtrl.deleteInsumo); // borrar solo admin

module.exports = router;
