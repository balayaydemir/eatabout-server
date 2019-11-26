const express = require('express');
const {
  requireAuth
} = require('../middleware/jwt-auth');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const {
  CLOUDINARY_URL
} = require('../config');
const Datauri = require('datauri');
const dUri = new Datauri();
const dataUri = req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);


const uploadRouter = express.Router();


/*let storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, '/tmp'); //__dirname + '/../../public/uploads');
  },
  filename: function(req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});*/

let storage2 = multer.memoryStorage();

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


let upload = multer({
  storage: storage2,
  limits: {
    fileSize: 1000000
  },
  fileFilter: (req, file, callback) => {
    checkFileType(file, callback);
  }
}).single('photo_upload');

uploadRouter.post('/', upload, requireAuth, function(req, res) {



  if (req.file) {
    const file = dataUri(req).content;
    console.log(file);
    cloudinary.uploader.upload(file).then((result) => {
      const image = result.url;
      return res.status(200).json(image);

    }).catch((err) => res.status(400).json({
      message: 'Image too large - please choose an image that is 3MB or less',
      data: {
        err
      }
    }));
  }
});




module.exports = uploadRouter;