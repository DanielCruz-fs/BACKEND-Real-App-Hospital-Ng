var express = require('express');
var mdAuth = require('../middlewares/authetication');
var app = express();
var Medic = require('../models/medic');
// ==========================
/** Obtain all medics */
// ==========================
app.get('/', (req, res, next) => {

  var fromDataPagination = req.query.from || 0;
  fromDataPagination = Number(fromDataPagination);

  Medic.find({}).populate('user', 'name email')
                .populate('hospital')
                .skip(fromDataPagination)
                .limit(5)
                .exec((err, medics) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message : 'Error loading medics',
        errors: err
      });
    }

    Medic.count({}, (err, count) => {
      res.status(200).json({
        ok: true,
        medics: medics,
        total: count
      });
    });

  });
});
// ============================
/** Update medic */
// ============================
app.put('/:id', mdAuth.verifyToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medic.findById(id, (err, medic) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error finding medic',
        errors: err
      });
    }

    if (!medic) {
      return res.status(400).json({
        ok: false,
        message : 'Medic with id: ' + id + 'no longer exists',
        errors: { message: 'There is no medic' }
      });
    }

    medic.name = body.name;
    //medic.img = body.img;
    medic.user = req.user._id;
    medic.hospital = body.hospital;

    medic.save((err, medicUpdated) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message : 'Error in updating medic',
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        medic: medicUpdated
      });
    });

  });
});
// ============================
/** Create new medic */
// ============================
app.post('/', mdAuth.verifyToken, (req, res) => {
  var body = req.body;

  var medic = new Medic({
    name: body.name,
    //img: body.img,
    user: req.user._id,
    hospital: body.hospital
  });
  medic.save((err, medicCreated) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error creating medic',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      medic: medicCreated,
      userToken: req.user
    });
  });
  
});
// ============================
/** Delete user by Id */
// ============================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
  var id = req.params.id;
  Medic.findByIdAndRemove(id, (err, medicRemoved) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message : 'Error removing medic',
        errors: err
      });
    }
    if (!medicRemoved) {
      return res.status(400).json({
        ok: false,
        message : 'Medic no longer exists',
        errors: { message: 'No reference for the current id' }
      });
    }
    res.status(201).json({
      ok: true,
      medic: medicRemoved
    });
  });
});
module.exports = app;