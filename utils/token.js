const jwt = require("jsonwebtoken");

const accessToken = async (user) => {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const token_key = process.env.TOKEN_KEY;

  const token = await jwt.sign(payload, token_key, { expiresIn: "1d" });

  return token;
};

const refreshToken = async (user) => {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const token_key = process.env.REFRESH_TOKEN;

  const token = await jwt.sign(payload, token_key, { expiresIn: "7d" });

  return token;
};

const verifyToken = async (token,type = "access") => {

  const secret = 
  type === "refresh" ? process.env.REFRESH_TOKEN : process.env.TOKEN_KEY
  const dcode = await jwt.verify(token,secret);
  return dcode;
};

module.exports = {
  accessToken,
  refreshToken,
  verifyToken,
};
