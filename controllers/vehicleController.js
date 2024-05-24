const Vehicle = require("../models/Vehicle");

module.exports.vehicle_get = async (req, res, next) => {
  
    res.render("index.html");
  
};

module.exports.vehicle_create = async (req, res, next) => {
  const vehicleData = req.body;
  const newVehicle = new Vehicle(vehicleData);
  await newVehicle.save();
  res.status(200).end();
};
module.exports.vehicle_list_get = async (req, res, next) =>{
  const vehicles =  await Vehicle.find().lean()
  .exec();
  res.json(vehicles);
};
