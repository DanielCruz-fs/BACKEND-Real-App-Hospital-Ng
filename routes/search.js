var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medic = require('../models/medic');
var User = require('../models/user');


// ================================
// Specific Searching Implementation
// ================================
app.get('/collection/:table/:searching', (req, res) => {
  var table = req.params.table;
  var search = req.params.searching;
  var regEx = new RegExp(search, 'i');
 
  var asyncPromiseSearch;
  switch (table) {
    case 'hospitals':
      asyncPromiseSearch = searchHospitals(search, regEx);
      break;
    case 'medics':
    asyncPromiseSearch = searchMedics(search, regEx);
      break;
    case 'users':
      asyncPromiseSearch = searchUsers(search, regEx);
      break;
    default:
      return res.status(400).json({
        ok: false,
        message : 'Invalid data'
      });
  }
  asyncPromiseSearch.then(data => {
    res.status(200).json({
      ok: true,
      [table] : data
    });
  });
});

// ================================
// General Searching Implementation
// ================================
app.get('/all/:searching', (req, res, next) => {
  var search = req.params.searching;
  var regEx = new RegExp(search, 'i');

  /**Consuming promises and getting data (asyn way) */
  Promise.all([ searchHospitals(search, regEx),
                searchMedics(search, regEx),
                searchUsers(search, regEx) ]).then( data => {
                  res.status(200).json({
                    ok: true,
                    hospitals : data[0],
                    medics: data[1],
                    users: data[2]
                  });
                });

});

/**Promise for async searching in hospitals collection... */
var searchHospitals = (search, regEx) => {
  return new Promise((resolve, reject) => {
    Hospital.find({ name: regEx }).populate('user', 'name email').exec((err, hospitals) => {
      if (err) {
        reject('Error searching hospiitals', err);
      } else {
        resolve(hospitals);
      }
    });
  });
};

/**Promise for async searching in medics collection... */
var searchMedics = (search, regEx) => {
  return new Promise((resolve, reject) => {
    Medic.find({ name: regEx }).populate('user', 'name email role')
                               .populate('hospital').exec((err, medics) => {
      if (err) {
        reject('Error searching medics', err);
      } else {
        resolve(medics);
      }
    });
  });
};

/**Promise for async searching in users (more than one field) collection... */
var searchUsers = (search, regEx) => {
  return new Promise((resolve, reject) => {
    User.find({}, 'name email role').or([{ name: regEx }, { email: regEx }]).exec((err, users) => {
      if (err) {
        reject('Error searching users', err);
      } else {
        resolve(users);
      }
    });
  });
};

module.exports = app;