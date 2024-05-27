const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.cookies.jwt;
  await extractUser(res, token);
  next();
};

const extractUser = async (res, token) => {
  res.locals.user = {};
  if (token) {
    const decodedToken = await jwt.verify(token, "efe");
    const user = await User.findOne({ username: decodedToken.username });
    res.locals.user = user??{};
  }
};


