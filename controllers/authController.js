const User = require("../models/User");
const utils = require("../utils/auth");
const bcrypt = require("bcrypt");
// module.exports.update = async (req, res) => {
//   const userData = req.body;
//   const userBD = await User.findOne({ username: "admin" });

//   userBD.password = await utils.getPasswordBcrypt("$Password12$");
//   await userBD.save();
//   res.json("cambiado");
//   // console.log("Se logeo el usuario : ", req.body);
// };
module.exports.verifyUser = async (req, res, next) => {
  if (res.locals.user.role!="academy") {
    res.status(404).json({ error: "404" });
  } else {
    next();
  }
};
module.exports.verifyAdmin = async (req, res, next) => {
  if (res.locals.user.role!="admin") {
    res.status(404).json({ error: "404" });
  } else {
    next();
  }
};
module.exports.login_post = async (req, res) => {
  const userData = req.body;
  const userBD = await User.findOne({ username: userData.username });

  if (
    userBD != null &&
    (await bcrypt.compare(userData.password, userBD.password))
  ) {
    //  utils.createToken({"username":userData.username})
    utils.configToken(res, { username: userBD.username });
    res.status(201).json({ message: "usuario logeado correctamente" });
  } else {
    res.status(400).json({
      error: "Datos invalidos",
    });
  }

  // console.log("Se logeo el usuario : ", req.body);
};

module.exports.login_get = async (req, res, next) => {
  res.render("login/index");
};
module.exports.logout_get = (req, res, next) => {
  if (res.locals.user) {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
    req.logout((err)=>{
    });
  } else {
    res.redirect("/");
  }
};
