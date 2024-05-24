const mongoose = require("mongoose");
const express = require("express");
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const vehicleController = require('./controllers/vehicleController');

const PORT = process.env.PORT;
let dbURI = process.env.MONGO_URI;
 
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(PORT);
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set('view engine', 'html');
app.engine('html',require('ejs').renderFile);

app.get("/vehicle/create",vehicleController.vehicle_get);
app.post("/vehicle/create",vehicleController.vehicle_create);
app.get("/vehicle/list",vehicleController.vehicle_list_get);

console.log("Servidor encendido en http://localhost:"+PORT);
