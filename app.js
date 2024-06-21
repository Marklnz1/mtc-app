// const mongoose = require("mongoose");
const express = require("express");
const app = express();
require("dotenv").config();
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

app.listen(PORT);
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

app.use("*", extractUser);

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

app.get("/login", authController.login_get);
app.post("/login", authController.login_post);
app.get("/logout", authController.logout_get);

app.post("/admin/academy/create", adminController.create_academy);
app.post("/admin/user/create", adminController.create_academy_user);
app.post("/admin/user/remove", adminController.remove_academy_user);
app.get("/admin/academy/list", adminController.list_academy);
app.post("/admin/academy", adminController.get_academy);

app.post(
  "/vehicle/create",
  vehicleValidator.vehicle_create,
  vehicleController.vehicle_create
);
app.post(
  "/vehicle/update",
  vehicleValidator.vehicle_update,
  vehicleController.vehicle_update
);
app.post("/vehicle/list", vehicleController.vehicle_list_get);

app.post("/vehicle/delete", vehicleController.vehicle_delete);
app.post("/vehicle/list/available", vehicleController.available_vehicle_list);

app.post(
  "/client/create",
  clientValidator.client_create,
  clientController.client_create
);
app.post("/client/read", clientController.client_read);
app.post(
  "/client/update",
  clientValidator.client_update,
  clientController.client_update
);
app.post("/client/delete", clientController.client_delete);

app.post("/client/list", clientController.client_list_get);
app.post("/client/schedules/get", clientController.schedule_list_get);
app.post("/client/schedules/remove", clientController.schedule_list_remove);

app.post("/schedule/list/create", scheduleController.schedule_list_create);
app.post("/schedule/list/get", scheduleController.schedule_list_get);
app.post("/schedule/range", scheduleController.schedule_range_get);
app.post("/schedule/delete", scheduleController.schedule_delete);

// app.get("/schedule/list",scheduleController.schedule_list_get);
app.post("/debt/create", transactionController.debt_create);
app.post("/payment/create", transactionController.payment_create);
app.post("/payment/update", transactionController.payment_update);
app.post("/payment/delete", transactionController.payment_delete);

app.post("/payment/list/get", transactionController.payment_list);
app.post("/debt/list/get", transactionController.debt_list);

console.log("Servidor encendido en http://localhost:" + PORT);
