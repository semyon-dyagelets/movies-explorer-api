const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-error');
const AuthorizationError = require('../errors/authorization-error');
const NotFoundError = require('../errors/not-found-error');
const AlreadyExistsError = require('../errors/already-exists-error');
const ServerError = require('../errors/server-error');

const login = (req, res, next) => {
  const {
    email,
    password,
  } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key',
          { expiresIn: '7d' },
        ),
      });
    })
    .catch(() => {
      next(new AuthorizationError('Неверный пользователь или пароль'));
    });
};

const createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create(
      {
        email,
        password: hash,
        name,
      },
    ))
    .then((user) => res.status(201).send({ user: user.toJSON() }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else if (err.name === 'MongoError' && err.code === 11000) {
        next(new AlreadyExistsError('Пользователь с таким email уже существует'));
      } else {
        next(new ServerError('Произошла ошибка'));
      }
    });
};

const getUser = (req, res, next) => {
  const myId = req.user._id;
  User.findById(myId)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else {
        next(new ServerError('Произошла ошибка'));
      }
    });
};

const updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному id не найден ');
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else if (err.statusCode === 404) {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      } else {
        next(new ServerError('Произошла ошибка'));
      }
    });
};

module.exports = {
  login,
  createUser,
  getUser,
  updateUser,
};
