const router = require('express').Router();
const {
  validateGetMovies,
  validateCreateMovie,
  validateDeleteMovie,
} = require('../middlewares/validation');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', validateGetMovies, getMovies);
router.post('/', validateCreateMovie, createMovie);
router.delete('/:movieId', validateDeleteMovie, deleteMovie);

module.exports = router;
