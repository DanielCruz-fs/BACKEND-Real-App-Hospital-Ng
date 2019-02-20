// Requirments
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Init variables
var app = express();

//****** body Parser *********//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Import Routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');

// Connection to data base (MongoDb)
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',
                           { useNewUrlParser: true, useCreateIndex: true },
                            (err, res) => {
                              if (err) throw err;
                                console.log('MongoDB: Online (Status)');
                            });

// Routes
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Listen requests
app.listen(3000, () => {
  console.log('Express Server running port 3000: online (Status)');
});