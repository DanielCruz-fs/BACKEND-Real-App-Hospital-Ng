var express = require('express');
var mdAuth = require('../middlewares/authetication');
var app = express();
var Hospital = require('../models/hospital');
// ==========================
/** Obtain all hospitals */
// ==========================
app.get('/', (req, res, next) => {
  
  var fromDataPagination = req.query.from || 0;
  fromDataPagination = Number(fromDataPagination);

  Hospital.find({}).populate('user', 'name email')
                   .skip(fromDataPagination)
                   .limit(5)
                   .exec((err, hospitals) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message : 'Error loading hospitals',
        errors: err
      });
    }

    Hospital.count({}, (err, count) => {
      res.status(200).json({
        ok: true,
        hospitals: hospitals,
        total: count
      });
    });

  });
});
// ============================
/** Update hospital */
// ============================
app.put('/:id', mdAuth.verifyToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error finding hospital',
        errors: err
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        message : 'Hospital with id: ' + id + 'does not exist',
        errors: { message: 'There is no hospital' }
      });
    }

    hospital.name = body.name;
    //hospital.img = body.img;
    hospital.user = req.user._id;

    hospital.save((err, hospitalUpdated) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message : 'Error in updating hospital',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalUpdated
      });
    });

  });
});
// ============================
/** Create new hospital */
// ============================
app.post('/', mdAuth.verifyToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    name: body.name,
    //img: body.img,
    user: req.user._id
  })
  hospital.save((err, hospitalCreated) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error creating hospital',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalCreated,
      userToken: req.user
    });
  });
  
});
// ============================
/** Delete hospital by Id */
// ============================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
  var id = req.params.id;
  Hospital.findByIdAndRemove(id, (err, hospitalRemoved) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error removing hospital',
        errors: err
      });
    }
    if (!hospitalRemoved) {
      return res.status(400).json({
        ok: false,
        message : 'Hospital no longer exists',
        errors: { message: 'No reference for the current id' }
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalRemoved
    });
  });
});
module.exports = app;