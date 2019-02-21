var express = require('express');
var bcrypt = require('bcryptjs');
var mdAuth = require('../middlewares/authetication');
var app = express();
var User = require('../models/user');
// ==========================
/** Obtain all users */
// ==========================
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
// ============================
/** Update user */
// ============================
app.put('/:id', mdAuth.verifyToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  User.findById(id, (err, user) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error finding user',
        errors: err
      });
    }

    if (!user) {
      return res.status(400).json({
        ok: false,
        message : 'User with id: ' + id + 'no existe',
        errors: { message: 'There is no user' }
      });
    }

    user.name = body.name;
    user.email = body.email;
    user.role = body.role;

    user.save((err, userUpdated) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message : 'Error in updating user',
          errors: err
        });
      }
      userUpdated.password = 'XD';

      res.status(200).json({
        ok: true,
        user: userUpdated
      });
    });

  });
});
// ============================
/** Create new user */
// ============================
app.post('/', mdAuth.verifyToken, (req, res) => {
  var body = req.body;

  var user = new User({
    name: body.name,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  })
  user.save((err, userCreated) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error creating user',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      user: userCreated,
      userToken: req.user
    });
  });
  
});
// ============================
/** Delete user bi Id */
// ============================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
  var id = req.params.id;
  User.findByIdAndRemove(id, (err, userRemoved) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error removing user',
        errors: err
      });
    }
    if (!userRemoved) {
      return res.status(400).json({
        ok: false,
        message : 'User no longer exists',
        errors: { message: 'No reference for the current id' }
      });
    }
    res.status(201).json({
      ok: true,
      users: userRemoved
    });
  });
});
module.exports = app;