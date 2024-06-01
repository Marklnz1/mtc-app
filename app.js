// const mongoose = require("mongoose");
const express = require("express");
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');

const extractUser = require('./middleware/extractUser');

const vehicleController = require('./controllers/vehicleController');
const clientController = require('./controllers/clientController');
const scheduleController = require('./controllers/scheduleController');
const transactionController = require('./controllers/transactionController');

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
app.set('view engine', 'html');
app.engine('html',require('ejs').renderFile);


app.use("*",extractUser);

app.get("/",(req, res, next)=>{
  let user = res.locals.user;
  // console.log(user);

    if(user.role=="admin"){
      res.render('admin/index');
    }else if(user.role=="academy"){
      res.render('academy/index');
    }else{
      res.render('login/index');
    }

});

app.get("/login",authController.login_get);
app.post("/login",authController.login_post);
app.get("/logout",authController.logout_get);

app.post("/admin/academy/create",adminController.create_academy);
app.post("/admin/user/create",adminController.create_academy_user);
app.post("/admin/user/remove",adminController.remove_academy_user);
app.get("/admin/academy/list",adminController.list_academy);
app.post("/admin/academy",adminController.get_academy);

app.post("/vehicle/create",vehicleController.vehicle_create);
app.get("/vehicle/list",vehicleController.vehicle_list_get);

app.post("/client/create",clientController.client_create);
app.post("/client/list",clientController.client_list_get);
app.post("/client/schedules/get",clientController.schedule_list_get);
app.post("/client/schedules/remove",clientController.schedule_list_remove);

app.post("/client",clientController.client_get);

app.post("/schedule/list/create",scheduleController.schedule_list_create);
app.post("/schedule/list/get",scheduleController.schedule_list_get);

app.post("/schedule/range",scheduleController.schedule_range_get);
app.post("/schedule/vehicle/list",scheduleController.schedule_vehicle_list);

// app.get("/schedule/list",scheduleController.schedule_list_get);
app.post("/debt/create",transactionController.debt_create);
app.post("/payment/create",transactionController.payment_create);
app.get("/payment/list/get",transactionController.payment_list);

console.log("Servidor encendido en http://localhost:"+PORT);
