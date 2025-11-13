const express = require('express');
const router = express.Router();
const ceramicsController = require('../controllers/ceramicsController');

router.post('/', ceramicsController.createCeramic);
router.get('/', ceramicsController.getCeramics);
router.get('/:id', ceramicsController.getCeramicById);
router.put('/:id', ceramicsController.updateCeramic);
router.delete('/:id', ceramicsController.deleteCeramic);

module.exports = router;