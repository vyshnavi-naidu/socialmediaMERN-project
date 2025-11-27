const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// storage with original filename + timestamp
const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null, uploadDir);
  },
  filename: function(req,file,cb){
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});

const fileFilter = (req,file,cb) => {
  if(!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'),false);
  cb(null,true);
};

module.exports = multer({ storage, fileFilter });