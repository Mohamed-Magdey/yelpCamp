const mongoose              = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  avatar: String,
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  reserPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: {
    type: String,
    default: false
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

