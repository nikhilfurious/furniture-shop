const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  name: { type: String },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{8,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address:{ type: String },
  isAdmin: { type: Boolean, default: false },

});

const User = mongoose.model("User", UserSchema);
module.exports = User;
