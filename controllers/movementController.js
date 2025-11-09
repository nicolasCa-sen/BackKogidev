const Movement = require('../models/Movement');
const Insumo = require('../models/Insumo');
const { logActivity } = require('../middleware/activityLogger');
const mongoose = require('mongoose');

exports.createMovement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { insumo: insumoId, tipo, cantidad, motivo, proveedor } = req.body;
    if (!insumoId || !tipo || !cantidad) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'Faltan campos' });
    }

    const insumo = await Insumo.findById(insumoId).session(session);
    if (!insumo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: 'Insumo no encontrado' });
    }

    // actualizar stock
    let nuevaCantidad = insumo.cantidad;
    if (tipo === 'entrada') nuevaCantidad += Number(cantidad);
    else if (tipo === 'salida') {
      if (insumo.cantidad < cantidad) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: 'Stock insuficiente' });
      }
      nuevaCantidad -= Number(cantidad);
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'Tipo invalido' });
    }

    insumo.cantidad = nuevaCantidad;
    await insumo.save({ session });

    const movement = new Movement({
      insumo: insumoId,
      tipo,
      cantidad,
      motivo,
      proveedor,
      usuario: req.user._id
    });

    await movement.save({ session });

    await logActivity(req.user, 'CREATE_MOVEMENT', `Movement:${movement._id}`, {
      insumo: insumoId, tipo, cantidad
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(movement);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const { insumo, tipo, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (insumo) filter.insumo = insumo;
    if (tipo) filter.tipo = tipo;

    const movements = await Movement.find(filter)
      .populate('insumo', 'nombre categoria')
      .populate('usuario', 'name email')
      .sort({ fecha: -1 })
      .skip((page-1)*limit)
      .limit(Number(limit));

    res.json(movements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
