
const mongoose = require('mongoose');const util = require('util')

// const log = require('../../../config/log');

const mongoOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  autoIndex: true,
  poolSize: 10,
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
};

const connect = () => mongoose.createConnection(process.env.MONGODB_URL, mongoOptions);

const connectToMongoDB = () => {
  const db = connect(process.env.MONGODB_URL);
  db.on('open', () => {
    console.log(`Mongoose connection open to ${JSON.stringify(process.env.MONGODB_URL)}`);
  });
  db.on('error', (err) => {
    console.log(`Mongoose connection error: ${err} with connection info ${JSON.stringify(process.env.MONGODB_URL)}`);
    process.exit(0);
  });
//   console.log("brroooo "+db.useDb);
  return db;
};

module.exports= (connectToMongoDB)();