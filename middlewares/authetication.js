var jwt = require('jsonwebtoken');
// ==========================
// Verify token
// ==========================
exports.verifyToken = (req, res, next) => {
  var token = req.query.token;
  jwt.verify(token, '@this-@is-@a-@seed', (err, decoded) => {
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

