const Insumo = require('../models/Insumo');
const Movement = require('../models/Movement');
const { logActivity } = require('../middleware/activityLogger');
const mongoose = require('mongoose');

exports.createInsumo = async (req, res) => {
  try {
    const data = req.body;
    const insumo = new Insumo(data);
    await insumo.save();
    await logActivity(req.user, 'CREATE_INSUMO', `Insumo:${insumo._id}`, { nombre: insumo.nombre });
    res.status(201).json(insumo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { categoria, q, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (categoria) filter.categoria = categoria;
    if (q) filter.nombre = { $regex: q, $options: 'i' };

    const insumos = await Insumo.find(filter)
      .skip((page-1)*limit)
      .limit(Number(limit))
      .sort({ nombre: 1 });

    res.json(insumos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const insumo = await Insumo.findById(req.params.id);
    if (!insumo) return res.status(404).json({ msg: 'Insumo no encontrado' });
    res.json(insumo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateInsumo = async (req, res) => {
  try {
    const updates = req.body;
    const insumo = await Insumo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!insumo) return res.status(404).json({ msg: 'Insumo no encontrado' });
    await logActivity(req.user, 'UPDATE_INSUMO', `Insumo:${insumo._id}`, updates);
    res.json(insumo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteInsumo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    const movements = await Movement.findOne({ insumo: id }).session(session);
    if (movements) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'No se puede eliminar: existen movimientos asociados' });
    }
    const insumo = await Insumo.findByIdAndDelete(id).session(session);
    if (!insumo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: 'Insumo no encontrado' });
    }
    await logActivity(req.user, 'DELETE_INSUMO', `Insumo:${insumo._id}`, { nombre: insumo.nombre });
    await session.commitTransaction();
    session.endSession();
    res.json({ msg: 'Insumo eliminado' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
