const ActivityLog = require('../models/ActivityLog');

exports.getActivities = async (req, res) => {
  try {
    const { usuario, action, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (usuario) filter.usuario = usuario;
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter)
      .populate('usuario', 'name email')
      .sort({ createdAt: -1 })
      .skip((page-1)*limit)
      .limit(Number(limit));

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
