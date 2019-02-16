// Requirments
var express = require('express');
var mongoose = require('mongoose');
// Init variables
var app = express();
// Connection to data base (MongoDb)
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
  if (err) throw err;
  console.log('MongoDB: Online (Status)');
});
// Routes
app.get('/', (request, response, next) => {
  response.status(200).json({
    ok: true,
    message : 'Request successful'
  });
});
// Listen requests
app.listen(3000, () => {
  console.log('Express Server running port 3000: online (Status)');
});