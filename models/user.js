const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      {
        validator: (value) => isEmail(value),
        message: 'Неверный формат почты',
      }],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    default: 'Киноман',
    minlength: 2,
    maxlength: 30,
  },
});

function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неверный пользователь или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неверный пользователь или пароль'));
          }
          return user;
        });
    });
}

userSchema.statics.findUserByCredentials = findUserByCredentials;

function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
}

userSchema.methods.toJSON = toJSON;

module.exports = mongoose.model('user', userSchema);
