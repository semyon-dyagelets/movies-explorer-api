const jwt = require('jsonwebtoken');
const AuthorizationError = require('../errors/authorization-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new AuthorizationError('Требуется авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key');
  } catch (err) {
    next(new AuthorizationError('Требуется авторизация'));
  }

  req.user = payload;
  return next();
};
