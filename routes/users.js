const router = require('express').Router();
const {
  validateGetUser,
  validateUpdateUser,
} = require('../middlewares/validation');

const {
  getUser,
  updateUser,
} = require('../controllers/users');

router.get('/me', validateGetUser, getUser);
router.patch('/me', validateUpdateUser, updateUser);

module.exports = router;
