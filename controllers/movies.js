const Movie = require('../models/movie');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');
const ServerError = require('../errors/server-error');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(() => next(new ServerError('Произошла ошибка')));
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(new ServerError('Произошла ошибка'));
      }
    });
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм с указанным id не найден');
      }
      if (!movie.owner.equals(req.user._id)) {
        throw new ForbiddenError('Можно удалять только свои фильмы');
      }
      return Movie.findByIdAndRemove(movieId)
        .then((deletedMovie) => res.send(deletedMovie));
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Невалидный id'));
      } else if (err.statusCode === 403) {
        next(new ForbiddenError('Можно удалять только свои фильмы'));
      } else if (err.statusCode === 404) {
        next(new NotFoundError('Фильм с указанным id не найден'));
      } else {
        next(new ServerError('Произошла ошибка'));
      }
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
