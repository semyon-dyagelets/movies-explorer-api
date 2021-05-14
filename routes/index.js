const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const NotFoundError = require('../errors/not-found-error');

router.use('/users', userRouter);
router.use('/movies', movieRouter);
router.use((req, res, next) => {
  next(new NotFoundError('Ресурс по указанному адресу не найден'));
});

module.exports = router;
