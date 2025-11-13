const mongoose = require('mongoose');
const Ceramic = require('../models/Ceramic');

exports.createCeramic = async (req, res) => {
  try {
    const c = new Ceramic(req.body);
    await c.save();
    return res.status(201).json(c);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
};

exports.getCeramics = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';
    const ceramics = await Ceramic.find(filter).sort({ name: 1 });
    return res.json(ceramics);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getCeramicById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const c = await Ceramic.findById(id);
    if (!c) return res.status(404).json({ message: 'Ceramic not found' });
    return res.json(c);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCeramic = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const c = await Ceramic.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ message: 'Ceramic not found' });
    return res.json(c);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
};

exports.deleteCeramic = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const c = await Ceramic.findByIdAndDelete(id);
    if (!c) return res.status(404).json({ message: 'Ceramic not found' });
    return res.json({ message: 'Ceramic deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};