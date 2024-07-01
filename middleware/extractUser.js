const jwt = require("jsonwebtoken");
const User = require("../models/User");
const util = require("util");
const Academy = require("../models/Academy");

module.exports = async (req, res, next) => {
  const token = req.cookies.jwt;
  res.locals.user = {};
  const googleUser = req.user;
  if (token) {
    const decodedToken = jwt.verify(token, process.env.TOKEN_LOGIN_KEY);
    try {
      const user = await User.findOne({ username: decodedToken.username });
      if (user != null) {
        res.locals.user = {
          username: user.username,
          academyId: user.academyId,
          role: user.role,
        };
      }
    } catch (error) {
      res.status(400).json({ error: "Error al autenticar al Usuario" });
    }
  } else if (googleUser) {
    const id = googleUser.id;
    let academy = await Academy.findOne({ gid: id });
    if (academy == null) {
      academy = await Academy.create({
        gid:id,
        name: id,
        description: "google",
      });
    }
    res.locals.user = {
      username: googleUser.displayName,
      academyId: academy._id,
      role: "academy",
    };
  } else {
    res.locals.user = {
      academyId: "665441962ca1381af8f870d3",
    };
  }
  next();
};
