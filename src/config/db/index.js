const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require("path");
const { dirname } = require('path');
dotenv.config();

async function connect() {
  try {
    // Lấy đường dẫn tới file ca-certificate.crt
    const mongoCertPath = path.join(__dirname, 'ca-certificate.crt');

    await mongoose.connect(
      process.env.DB_URL, {
      authSource: 'admin',
      replicaSet: 'db-lobo',
      tls: true,
      tlsCAFile: mongoCertPath
    })
    console.log('Connect successfully');
  } catch (error) {
    console.log('Connect failure');
  }
}

module.exports = { connect };