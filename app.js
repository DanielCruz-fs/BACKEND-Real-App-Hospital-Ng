// Requirments
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Init variables
var app = express();
/**Enable Cors */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
});

//****** body Parser *********//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Import Routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var hospitalRoutes = require('./routes/hospital');
var medicRoutes = require('./routes/medic');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/images');
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
app.use('/hospital', hospitalRoutes);
app.use('/medic', medicRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Listen requests
app.listen(3000, () => {
  console.log('Express Server running port 3000: online (Status)');
});