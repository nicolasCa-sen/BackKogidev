const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../middleware/activityLogger');

const jwtSecret = process.env.JWT_SECRET || 'secret';
const jwtExpires = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Email already in use' });

    user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpires });

    await logActivity(user, 'REGISTER', `User:${user._id}`, { email: user.email });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpires });

    await logActivity(user, 'LOGIN', `User:${user._id}`, { email: user.email });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt'); // Seleccionamos solo los campos que queremos exponer
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    await logActivity(user, 'DELETE', `User:${user._id}`, { email: user.email });

    res.json({ msg: 'Usuario eliminado correctamente', user: { id: user._id, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};