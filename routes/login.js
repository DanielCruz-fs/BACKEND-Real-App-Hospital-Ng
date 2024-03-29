var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();
var User = require('../models/user');
var mdAuth = require('../middlewares/authetication');
var fs = require('fs');

// Google verification TOKEN
var CLIENT_ID = '761908812877-5muo95srnpdi8djjtla8940a349eo24f.apps.googleusercontent.com';
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ================================
// RSA Private key
//=================================
var privateKey = fs.readFileSync('./private.key', 'utf-8');

// ================================
// Google Authentication
// ================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  //const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return {
    name: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}

app.post('/google', async (req, res, next) => {
  var token = req.body.token;

  var googleUser = await verify(token).catch(e => {
    return res.status(403).json({
      ok: false,
      message: 'Invalid Token'
    });
  });
  // Save user to DB MOngo
  User.findOne( {email: googleUser.email} , (err, userDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message : 'Error finding user by email',
        errors: err
      });
    }
    if (userDB) {
      if (userDB.google === false) {
        return res.status(400).json({
          ok: false,
          message : 'Use normal authentication'
        });
      } else {
        /**Create token */
        var token = jwt.sign( { usuario: userDB }, '@this-@is-@a-@seed', { expiresIn: 14400 });
        /** */
        res.status(200).json({
          ok: true,
          user: userDB,
          token: token,
          id: userDB._id
        });
      }
    } else {
      /**User does not exist, must create */
      var user = new User();
      user.name = googleUser.name;
      user.email = googleUser.email;
      user.img = googleUser.img;
      user.google = true;
      user.password = 'XD';
      
      user.save((err, userDB) => {
        /**Create token */
        var token = jwt.sign( { usuario: userDB }, '@this-@is-@a-@seed', { expiresIn: 14400 });
        /** */
        res.status(200).json({
          ok: true,
          user: userDB,
          token: token,
          id: userDB._id
        });
      });

    }
  });

  // res.status(200).json({
  //   ok: true,
  //   googleUser : googleUser
  // });
});
// ================================
// Common Authentication
// ================================
app.post('/', (req, res) => {
  var body = req.body;

  User.findOne({ email: body.email }, (err, userDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message : 'Error finding user by email',
        errors: err
      });
    }
    if (!userDB) {
      return res.status(400).json({
        ok: false,
        message : 'Worng credentials - email',
        errors: err
      });
    }
    if (!bcrypt.compareSync(body.password, userDB.password)) {
      return res.status(400).json({
        ok: false,
        message : 'Worng credentials - password',
        errors: err
      });
    }
    /**Create token */
    // For not returning the hash password
    // userDB.password = 'XD'; 

    // HS256
    // var token = jwt.sign( { usuario: userDB }, '@this-@is-@a-@seed', { expiresIn: 14400 });

    // RS256
    var token = jwt.sign( { usuario: userDB }, privateKey, { expiresIn: 14400, algorithm: 'RS256' });

    /** */
    res.status(200).json({
      ok: true,
      user: userDB,
      token: token,
      id: userDB._id
    });
  });
});
// ================================
// Renew Token implementation
// ================================
app.get('/renewtoken', mdAuth.verifyToken, (req, res) => {

  var token = jwt.sign( { usuario: req.user }, '@this-@is-@a-@seed', { expiresIn: 14400 });
  res.status(200).json({
    ok: true,
    token: token
  });
});
module.exports = app;