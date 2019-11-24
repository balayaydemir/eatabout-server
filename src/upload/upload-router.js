const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const multer = require('multer');


const uploadRouter = express.Router();
let storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, __dirname + '/../../public/uploads');
  },
  filename: function(req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});

uploadRouter.post('/', requireAuth, function(req, res) {
  let upload = multer({ storage: storage }).single('photo_upload');
  upload(req, res, function(err) {
    if (err) {
      return res.end('cannot upload');
    }
    res.json(req.file.filename);
  });
});




module.exports = uploadRouter;