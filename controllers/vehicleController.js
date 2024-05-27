const VehicleSchema = require("../models/Vehicle");
const { getModelByTenant } = require("../utils/tenant");
module.exports.vehicle_get = async (req, res, next) => {

  res.render("index.html");

};

module.exports.vehicle_create = async (req, res, next) => {
  let user = res.locals.user;
  // if (user.academyId == null) {
  //   res.status(400).end();

  //   return;
  // }
  const academyId= user.academyId;
// console.log("entre Xd"+req.body);
  const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
  const vehicleData = req.body;
  const newVehicle = new Vehicle(vehicleData);
  await newVehicle.save();
  res.status(200).end();
};
module.exports.vehicle_list_get = async (req, res, next) => {
  let user = res.locals.user;

  const academyId= user.academyId;
  const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
  const vehicles =  await Vehicle.find().lean()
  .exec();
  res.json({"vehicles":vehicles??[]});
};
