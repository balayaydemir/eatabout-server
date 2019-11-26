const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const multer = require('multer');
const path = require('path');


const uploadRouter = express.Router();



let storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, __dirname + '/../../public/uploads');
  },
  filename: function(req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

let checkFileType = (file, callback) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return callback(null, true);
  } else {
    callback('Error: Images Only');
  }
};

uploadRouter.post('/', requireAuth, function(req, res) {

  let upload = multer({ 
    storage: storage,
    limits: {fileSize: 3000000},
    fileFilter: (req, file, callback) => {
      checkFileType(file, callback);
    } 
  }).single('photo_upload');
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json(__dirname);
    }
    res.json(req.file.filename);
  });
});




module.exports = uploadRouter;