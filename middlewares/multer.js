const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req,file,cb) =>{
  if(file.mimetype.startsWith("image/")){
    cb(null,true)
  } else {
    cb(new Error ("only image file are allowed"))
  }
}
const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {fileSize: 2 * 1024 * 1024} // max 2MB
  });
module.exports = upload;
