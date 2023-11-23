const multer = require('multer');
const fs = require('fs');
const path = require('path');

const isFolderExist = function(mainFolderName) {
  const dir = path.join(__dirname, '../..', '/'+mainFolderName+ '/');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    return dir;
  } else {
    return dir;
  }
};

const isvalidate = function(folderName) {
  isFolderExist('public');
  const dir = path.join(__dirname, '../..', '/public'+ '/'+ folderName + '/');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    return dir;
  } else {
    return dir;
  }
};


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, isvalidate('images'));
  },
  filename: function(req, file, cb) {
    req.file = file.fieldname + '-' + file.originalname.replace(/[^a-zA-Z0-9.]+/g, '');
    cb(null, req.file);
  },
});

const checkFileType = function(file, cb) {
  // Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/;

  // check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error('Error: You can Only Upload Images!!'));
  }
};

const checkDocType = function(file,cb) {
  const fileTypes = /jpeg|jpg|png|svg|pdf|doc/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error('Error: You can Only Upload Image, Pdf or Doc!'));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});
const businessDocUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkDocType(file, cb);
  },
})

const cpUpload = upload.fields([
  {name: 'profile_picture'},
  {name: 'event_image'},
  {name: 'chapter_image'},
  {name: 'business_logo'},
]);

const docUpload = businessDocUpload.fields([
  {name: 'business_document'}
]);

module.exports = {cpUpload, docUpload};
