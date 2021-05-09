var jwt = require('jsonwebtoken');
var fs = require('fs');

// ================================
// RSA Public key
//=================================
var publicKey = fs.readFileSync('./public.key', 'utf-8');

// ==========================
// Verify token
// ==========================
exports.verifyToken = (req, res, next) => {
  var token = req.query.token;

  // ========================
  // HS256
  // ========================
  // jwt.verify(token, '@this-@is-@a-@seed', (err, decoded) => {
  //   if (err) {
  //     return res.status(401).json({
  //       ok: false,
  //       message: 'Invalid Token',
  //       errors: err
  //     });
  //   }
  //   req.user = decoded.usuario; // decoded.usuario comes in spanish from jwt team
  //   next();
  //   // res.status(200).json({
  //   //   ok: true,
  //   //   decoded: decoded
  //   // });
  // });

  // ========================
  // RS256
  // ========================
  jwt.verify(token, publicKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid Token',
        errors: err
      });
    }
    req.user = decoded.usuario; // decoded.usuario comes in spanish from jwt team
    next();
    // res.status(200).json({
    //   ok: true,
    //   decoded: decoded
    // });
  });
};

