var express = require('express');
var app = express();
var User = require('../models/user');
/**Obtain all users */
app.get('/', (request, response, next) => {
  User.find({}, 'name email img role').exec((err, users) => {
    if (err) {
      return response.status(500).json({
        ok: false,
        message : 'Error loading users',
        errors: err
      });
    }

    response.status(200).json({
      ok: true,
      users: users
    });
  });
});

/**Create new user */
app.post('/', (req, res) => {
  var body = req.body;

  var user = new User({
    name: body.name,
    email: body.email,
    password: body.password,
    img: body.img,
    role: body.role
  })
  user.save((err, userCreated) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message : 'Error creating user',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      users: userCreated
    });
  });
  
});
module.exports = app;