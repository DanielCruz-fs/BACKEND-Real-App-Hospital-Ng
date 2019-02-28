var express = require('express');
var path = require('path');
const fs = require('fs');
var app = express();
app.get('/:type/:img', (req, res, next) => {
  var type = req.params.type;
  var img = req.params.img;

  var imgPath = path.resolve(__dirname, `../uploads/${type}/${img}`);
  if (fs.existsSync(imgPath)) {
    res.sendFile(imgPath);
  } else {
    var noImgPath = path.resolve(__dirname, '../assets/no-image.png');
    res.sendFile(noImgPath);
  }
  // res.status(200).json({
  //   ok: true,
  //   message : 'Request successful Images'
  // });
});
module.exports = app;