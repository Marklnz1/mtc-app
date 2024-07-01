// const mongoose = require("mongoose");
const express = require("express");
const app = express();
require("dotenv").config();
const passport = require('passport');
// const session = require('express-session');
const session = require('cookie-session');
const util = require("util");

require('./utils/google_auth');

const cookieParser = require("cookie-parser");
const authController = require("./controllers/authController");
const adminController = require("./controllers/adminController");

const extractUser = require("./middleware/extractUser");

const vehicleController = require("./controllers/vehicleController");
const clientController = require("./controllers/clientController");
const scheduleController = require("./controllers/scheduleController");
const transactionController = require("./controllers/transactionController");
const clientValidator = require("./validator/clientValidator");
const vehicleValidator = require("./validator/vehicleValidator");

const PORT = process.env.PORT;
// let dbURI = process.env.MONGODB_URL;

// mongoose.connect(dbURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
function isLoggedIn(req,res,next){
  req.user?next():res.sendStatus(401);
}
app.listen(PORT);
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);


app.use(session({
  secret:'secret',
  resave:false,
  saveUninitialized:true,
  cookie:{secure:false}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("*", extractUser);

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/login'
}));
app.get('/auth/google/failure',isLoggedIn,(req,res)=>{
  res.send('error en el login');
});
// app.get('/auth/google/success',isLoggedIn,(req,res)=>{
//   res.send('hello there!'+util.inspect(req.user));
// });

app.get("/", (req, res, next) => {
  let user = res.locals.user;
  // console.log(user);

  if (user.role == "admin") {
    res.render("admin/index");
  } else if (user.role == "academy") {
    res.render("academy/index");
  } else {
    res.render("home/index");
  }
});
app.get("/home", (req, res, next) => {
  res.render("home/index");
});
// app.get("/update", authController.update);

app.get("/login", authController.login_get);
app.post("/login", authController.login_post);
app.get("/logout", authController.logout_get);

app.post(
  "/admin/academy/create",
  authController.verifyAdmin,
  adminController.create_academy
);
app.post(
  "/admin/user/create",
  authController.verifyAdmin,
  adminController.create_academy_user
);
app.post(
  "/admin/user/remove",
  authController.verifyAdmin,
  adminController.remove_academy_user
);
app.get(
  "/admin/academy/list",
  authController.verifyAdmin,
  adminController.list_academy
);
app.post("/admin/academy", authController.verifyAdmin, adminController.get_academy);

app.post(
  "/vehicle/create",
  authController.verifyUser,
  vehicleValidator.vehicle_create,
  vehicleController.vehicle_create
);
app.post(
  "/vehicle/update",
  authController.verifyUser,
  vehicleValidator.vehicle_update,
  vehicleController.vehicle_update
);
app.post(
  "/vehicle/list",
  authController.verifyUser,
  vehicleController.vehicle_list_get
);

app.post(
  "/vehicle/delete",
  authController.verifyUser,
  vehicleController.vehicle_delete
);
app.post(
  "/vehicle/list/available",
  authController.verifyUser,
  vehicleController.available_vehicle_list
);

app.post(
  "/client/create",
  authController.verifyUser,
  clientValidator.client_create,
  clientController.client_create
);
app.post(
  "/client/read",
  authController.verifyUser,
  clientController.client_read
);
app.post(
  "/client/update",
  authController.verifyUser,
  clientValidator.client_update,
  clientController.client_update
);
app.post(
  "/client/delete",
  authController.verifyUser,
  clientController.client_delete
);

app.post(
  "/client/list",
  authController.verifyUser,
  clientController.client_list_get
);
app.post(
  "/client/schedules/get",
  authController.verifyUser,
  clientController.schedule_list_get
);
app.post(
  "/client/schedules/remove",
  authController.verifyUser,
  clientController.schedule_list_remove
);

app.post(
  "/schedule/list/create",
  authController.verifyUser,
  scheduleController.schedule_list_create
);
app.post(
  "/schedule/list/get",
  authController.verifyUser,
  scheduleController.schedule_list_get
);
app.post(
  "/schedule/range",
  authController.verifyUser,
  scheduleController.schedule_range_get
);
app.post(
  "/schedule/delete",
  authController.verifyUser,
  scheduleController.schedule_delete
);

// app.get("/schedule/list",scheduleController.schedule_list_get);
app.post(
  "/debt/create",
  authController.verifyUser,
  transactionController.debt_create
);
app.post(
  "/payment/create",
  authController.verifyUser,
  transactionController.payment_create
);
app.post(
  "/payment/update",
  authController.verifyUser,
  transactionController.payment_update
);
app.post(
  "/payment/delete",
  authController.verifyUser,
  transactionController.payment_delete
);

app.post(
  "/payment/list/get",
  authController.verifyUser,
  transactionController.payment_list
);
app.post(
  "/debt/list/get",
  authController.verifyUser,
  transactionController.debt_list
);

console.log("Servidor encendido en http://localhost:" + PORT);
