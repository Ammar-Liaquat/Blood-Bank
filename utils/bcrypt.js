const bcrypt = require("bcrypt");

const hashPassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};
const comparePassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};
module.exports = {
  hashPassword,
  comparePassword,
};
