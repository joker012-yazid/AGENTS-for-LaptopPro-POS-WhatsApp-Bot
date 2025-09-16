const roleTokens = {
  'admin-token': ['admin'],
  'kaunter-token': ['kaunter'],
  'teknikal-token': ['teknikal']
};

function authenticate(req, res, next) {
  const token = req.header('x-token');
  req.user = { roles: roleTokens[token] || [] };
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    const userRoles = (req.user && req.user.roles) || [];
    if (!userRoles.some(r => roles.includes(r))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
