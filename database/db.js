var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
