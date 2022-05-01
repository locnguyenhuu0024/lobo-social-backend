const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    lastname: {
      type: String,
      required: true,
      maxlength: 32,
      minlength: 2
    },
    firstname: {
      type: String,
      required: true,
      maxlength: 32,
      minlength: 2
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: { unique: true },
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    },
    password: {
      type: String,
      required: true,
    },
    admin: {
      type: Boolean,
      required: true,
      default: false,
    },
    phoneNumber: {
      type: String,
      maxlength: 11,
      minlength: 10
    },
    userImage: {
      type: String,
      default: "/uploads/user.png",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    histories: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    published: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    blockList: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;