const express = require('express');
const router = express.Router();
const { register, login , getUsers, deleteUser} = require('../controllers/authController');
const { body } = require('express-validator');

router.post('/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  register);

router.post('/login', login);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
module.exports = router;
