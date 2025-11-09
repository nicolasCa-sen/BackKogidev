const express = require('express');
const router = express.Router();
const activityCtrl = require('../controllers/activityController');
const { authenticate, permit } = require('../middleware/auth');

router.get('/', authenticate, permit('admin'), activityCtrl.getActivities);

module.exports = router;
