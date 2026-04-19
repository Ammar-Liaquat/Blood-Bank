const deleteFile = require("../utils/deleteFile");
const validate = (schema) => (req, res, next) => {
  
  const { error } = schema.validate(req.body);

  if (error) {

       if (req.file) {
      deleteFile(req.file.path);
    }
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = validate;
