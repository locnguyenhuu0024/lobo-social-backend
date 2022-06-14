const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require("path");
const { dirname } = require('path');
dotenv.config();

async function connect() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connect successfully');
  } catch (error) {
    console.log(error);
    console.log('Connect failure');
  }
}

module.exports = { connect };