var express = require('express');
var fileUplooad = require('express-fileupload');
var fs = require('fs');
var app = express();

var User = require('../models/user');
var Medic = require('../models/medic');
var Hospital = require('../models/hospital');

// default options for uploading files
app.use(fileUplooad());

app.put('/:type/:id', (req, res, next) => {
  var type = req.params.type;
  var id = req.params.id;
  // types validation
  var validtypes = ['medics', 'hospitals', 'users'];
  if (validtypes.indexOf(type) < 0) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid collection',
      errors: { message: `Only: ${validtypes.join(' ')}`}
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      message: 'No files were found',
      errors: { message: 'Select some images'}
    });
  }
  // Getting file's name and extension
  var archive = req.files.image;
  var arrayName = archive.name.split('.');
  var extArchive = arrayName[arrayName.length - 1];
  // valid extensions
  var validExt = ['png', 'jpg', 'gif', 'jpeg'];
  if (validExt.indexOf(extArchive) < 0) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid extension',
      errors: { message: `Only: ${validExt.join(' ')}`}
    });
  }
  // Custom archive's name
  // 234234234-123.png
  var archName = `${id}-${new Date().getMilliseconds()}.${extArchive}`;
  //Moving the file
  var path = `./uploads/${type}/${archName}`;
  archive.mv( path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error in moving file',
        errors: err
      });
    }
    uploadPerFile(type, id, archName, res);
    // res.status(200).json({
    //   ok: true,
    //   message : 'Request successful (file uploaded)'
    // });

  });
});

var uploadPerFile = (type, id, archName, res) => {
  switch (type) {
    case 'users':
      User.findById(id, (err, user) => {

        if (!user) {
          return res.status(400).json({
            ok: false,
            message : 'User does not exist.',
            userUpdated: { error: 'User not found' }
          });  
        }
        var oldPath = `./uploads/users/${user.img}`;
        // if file already exits
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }

        user.img = archName;
        user.save((err, userUpdated) => {
          userUpdated.password = 'XXX';
          res.status(200).json({
            ok: true,
            message : 'Image Updated (file uploaded: User)',
            userUpdated: userUpdated
          });  
        });
      });
      break;
    case 'medics':
    Medic.findById(id, (err, medic) => {
      if (!medic) {
        return res.status(400).json({
          ok: false,
          message : 'Medic does not exist.',
          userUpdated: { error: 'Medic not found' }
        });  
      }
      var oldPath = `./uploads/medics/${medic.img}`;
      // if file already exits
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      medic.img = archName;
      medic.save((err, medicUpdated) => {
        res.status(200).json({
          ok: true,
          message : 'Image Updated (file uploaded: Medic)',
          medicUpdated: medicUpdated
        });  
      });
    });
      break;
    case 'hospitals':
    Hospital.findById(id, (err, hospital) => {
      if (!hospital) {
        return res.status(400).json({
          ok: false,
          message : 'Hospital does not exist.',
          userUpdated: { error: 'Hospital not found' }
        });  
      }
      var oldPath = `./uploads/hospitals/${hospital.img}`;
      // if file already exits
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      hospital.img = archName;
      hospital.save((err, hospitalUpdated) => {
        res.status(200).json({
          ok: true,
          message : 'Image Updated (file uploaded: Hospital)',
          hospitalUpdated: hospitalUpdated
        });  
      });
    });
      break;
    default:
      return res.status(400).json({
        ok: false,
        message : 'Invalid Type URL'
      });
  }
};
module.exports = app;