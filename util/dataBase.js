/* const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;

const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://marcamgad:Mark2003@cluster0.i8jhymd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      console.log('Connected to MongoDB');
      _db = client.db(); // Store the database instance
      callback(); // Call the callback function to signal that the connection is ready
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db; // Return the database instance if it's set
  }
  throw 'No database found'; // Throw an error if the database is not found
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
 */