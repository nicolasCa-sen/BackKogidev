const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Ceramic = require('../models/Ceramic');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function prepareProductItems(items = []) {
  const prepared = [];
  for (const it of items) {
    if (!it.productId || !isValidId(it.productId)) {
      throw { status: 400, message: 'Invalid or missing productId in products' };
    }
    const product = await Product.findById(it.productId);
    if (!product) throw { status: 400, message: `Product not found: ${it.productId}` };
    if (!product.active) throw { status: 400, message: `Product not active: ${product.name}` };
    const qty = Number(it.quantity);
    if (!qty || qty <= 0) throw { status: 400, message: 'Product quantity must be > 0' };
    const price = (typeof it.price === 'number') ? it.price : product.price;
    prepared.push({
      productId: product._id,
      name: product.name,
      quantity: qty,
      price
    });
  }
  return prepared;
}

async function prepareCeramicItems(items = []) {
  const prepared = [];
  for (const it of items) {
    if (!it.ceramicId || !isValidId(it.ceramicId)) {
      throw { status: 400, message: 'Invalid or missing ceramicId in ceramics' };
    }
    const ceramic = await Ceramic.findById(it.ceramicId);
    if (!ceramic) throw { status: 400, message: `Ceramic not found: ${it.ceramicId}` };
    if (!ceramic.active) throw { status: 400, message: `Ceramic not active: ${ceramic.name}` };
    const qty = Number(it.quantity);
    if (!qty || qty <= 0) throw { status: 400, message: 'Ceramic quantity must be > 0' };
    const price = (typeof it.price === 'number') ? it.price : ceramic.price;
    prepared.push({
      ceramicId: ceramic._id,
      name: ceramic.name,
      quantity: qty,
      price
    });
  }
  return prepared;
}

function computeTotal(products = [], ceramics = []) {
  let total = 0;
  for (const p of products) total += (p.price || 0) * (p.quantity || 0);
  for (const c of ceramics) total += (c.price || 0) * (c.quantity || 0);
  return total;
}

exports.createSale = async (req, res) => {
  try {
    const { products = [], ceramics = [], customer = '', date, totalAmount, isExpense } = req.body;
    
    // ⭐ NUEVO: Permitir crear gastos directamente (sin productos/cerámicas)
    if (isExpense && totalAmount < 0) {
      // Es un gasto simple
      const sale = new Sale({
        products: [],
        ceramics: [],
        totalAmount: totalAmount, // Ya viene negativo del frontend
        customer,
        date: date || new Date(),
        isExpense: true
      });
      await sale.save();
      return res.status(201).json(sale);
    }

    // Validación normal para ventas
    if ((!products || products.length === 0) && (!ceramics || ceramics.length === 0)) {
      return res.status(400).json({ message: 'At least one product or ceramic required' });
    }

    const preparedProducts = await prepareProductItems(products);
    const preparedCeramics = await prepareCeramicItems(ceramics);
    const computedTotal = computeTotal(preparedProducts, preparedCeramics);

    // Crear la venta
    const sale = new Sale({
      products: preparedProducts,
      ceramics: preparedCeramics,
      totalAmount: computedTotal,
      customer,
      date: date || new Date(),
      isExpense: false
    });

    await sale.save();

    // Eliminar las cerámicas vendidas de la base de datos
    if (preparedCeramics.length > 0) {
      console.log('🗑️ Eliminando cerámicas vendidas...');
      
      for (const ceramicItem of preparedCeramics) {
        try {
          const deleted = await Ceramic.findByIdAndDelete(ceramicItem.ceramicId);
          if (deleted) {
            console.log(`✅ Cerámica eliminada: ${ceramicItem.name} (${ceramicItem.ceramicId})`);
          } else {
            console.warn(`⚠️ Cerámica no encontrada para eliminar: ${ceramicItem.ceramicId}`);
          }
        } catch (deleteError) {
          console.error(`❌ Error al eliminar cerámica ${ceramicItem.name}:`, deleteError);
        }
      }
    }

    // Devolver la venta con populate
    const populated = await Sale.findById(sale._id)
      .populate('products.productId', 'name price')
      .populate('ceramics.ceramicId', 'name price');

    return res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getSales = async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = {};
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }
    const sales = await Sale.find(filter)
      .sort({ date: -1 })
      .populate('products.productId', 'name price')
      .populate('ceramics.ceramicId', 'name price');
    return res.json(sales);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid sale id' });
    const sale = await Sale.findById(id)
      .populate('products.productId', 'name price')
      .populate('ceramics.ceramicId', 'name price');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    return res.json(sale);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid sale id' });

    const existing = await Sale.findById(id);
    if (!existing) return res.status(404).json({ message: 'Sale not found' });

    const productsInput = req.body.products !== undefined ? req.body.products : existing.products;
    const ceramicsInput = req.body.ceramics !== undefined ? req.body.ceramics : existing.ceramics;

    const preparedProducts = Array.isArray(productsInput) ? await prepareProductItems(productsInput) : [];
    const preparedCeramics = Array.isArray(ceramicsInput) ? await prepareCeramicItems(ceramicsInput) : [];

    const totalAmount = computeTotal(preparedProducts.length ? preparedProducts : existing.products,
                                     preparedCeramics.length ? preparedCeramics : existing.ceramics);

    const updated = await Sale.findByIdAndUpdate(
      id,
      {
        products: preparedProducts.length ? preparedProducts : existing.products,
        ceramics: preparedCeramics.length ? preparedCeramics : existing.ceramics,
        totalAmount,
        customer: req.body.customer !== undefined ? req.body.customer : existing.customer,
        date: req.body.date !== undefined ? req.body.date : existing.date
      },
      { new: true, runValidators: true }
    )
      .populate('products.productId', 'name price')
      .populate('ceramics.ceramicId', 'name price');

    return res.json(updated);
  } catch (err) {
    console.error(err);
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid sale id' });
    const sale = await Sale.findByIdAndDelete(id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    return res.json({ message: 'Sale deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getTotalBetweenDates = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start || end) {
      match.date = {};
      if (start) match.date.$gte = new Date(start);
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        match.date.$lte = endDate;
      }
    }
    const agg = [
      { $match: match },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ];
    const resAgg = await Sale.aggregate(agg);
    const total = (resAgg[0] && resAgg[0].total) ? resAgg[0].total : 0;
    return res.json({ total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};