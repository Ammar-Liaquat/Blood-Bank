const jwt = require("jsonwebtoken");

const middelware = async (req, res, next) => {
  try {
    const auth = req.headers["authorization"];
    const token = auth && auth.split(" ")[1];

    if (!token)
      return res.status(401).json({
        message: "invalid token",
        code: 401,
      });
    const decode = await jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decode;
    next();
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      code: 500,
      error: error.message,
    });
  }
};
module.exports = middelware
