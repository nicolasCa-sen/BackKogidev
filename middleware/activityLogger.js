const ActivityLog = require('../models/ActivityLog');

/**
 * Llamar this.log(req, action, resource, details) en controladores
 * También se provee middleware para registrar acciones automáticamente
 */
async function logActivity(user, action, resource = null, details = null) {
  try {
    await ActivityLog.create({
      usuario: user ? user._id : null,
      action,
      resource,
      details
    });
  } catch (err) {
    console.error('Error logging activity', err);
  }
}

// middleware opcional para log de cada request: si quieres registrar todas las llamadas debes activarlo
function requestLogger(actionMaker) {
  return async (req, res, next) => {
    // actionMaker puede ser una función que devuelva {action, resource, details}
    if (typeof actionMaker === 'function') {
      const info = actionMaker(req);
      if (info) {
        await logActivity(req.user, info.action, info.resource, info.details);
      }
    }
    next();
  };
}

module.exports = { logActivity, requestLogger };
