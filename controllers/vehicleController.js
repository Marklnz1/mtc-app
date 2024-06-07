const VehicleSchema = require("../models/Vehicle");
const { getModelByTenant } = require("../utils/tenant");
const util = require('util')
// module.exports.vehicle_get = async (req, res, next) => {

//   res.render("index.html");

// };
// module.exports.vehicle_remove = async (req, res, next) => {
//   let user = res.locals.user;
//   const academyId= user.academyId??"6654558ffee910176819a803";
//   const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
//   const vehicleData = req.body;
//   const newVehicle = new Vehicle(vehicleData);
//   await newVehicle.save();
//   res.status(200).end();
// };
module.exports.vehicle_delete = async (req, res, next) => {
  let user = res.locals.user;
  // if (user.academyId == null) {
  //   res.status(400).end();

  //   return;
  // }
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  // console.log("entre Xd"+req.body);
  const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
  const vehicleId = req.body.vehicleId;
  const state = "removed";
   await Vehicle.findOneAndUpdate({_id:vehicleId},{state});
   console.log("ELIMINANDO ????? "+vehicleId);
  res.json({});
};
module.exports.vehicle_update = async (req, res, next) => {
  let user = res.locals.user;
  // if (user.academyId == null) {
  //   res.status(400).end();

  //   return;
  // }
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  // console.log("entre Xd"+req.body);
  const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
  const vehicleId = req.body.vehicleId;
  const vehicleData = req.body.vehicleData;
  const vehicle  = await Vehicle.findById(vehicleId);
  if(vehicleData.plate.trim()!=vehicle.plate.trim()){
    const vehicleClone = await Vehicle.findOne({plate:vehicleData.plate,state: { $ne: 'removed' }});
    if(vehicleClone!=null){
      res.json({"error":"La placa le pertenece a otro vehiculo"});
      return;
    }
  }

   await Vehicle.findOneAndUpdate({_id:vehicleId},vehicleData);
   console.log("ACTUALIZANDO ????? "+vehicleId+"  data "+util.inspect(vehicleData));
  res.json({});
};
module.exports.vehicle_create = async (req, res, next) => {
  let user = res.locals.user;
  // if (user.academyId == null) {
  //   res.status(400).end();

  //   return;
  // }
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  // console.log("entre Xd"+req.body);
  const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
  const vehicleData = req.body;
  const vehicle  = await Vehicle.findOne({plate:vehicleData.plate,state: { $ne: 'removed' }});
  if(vehicle!=null){
    res.json({"error":"La Placa le Pertenece a Otro Vehiculo"})
    return;
  }

  const newVehicle = new Vehicle(vehicleData);
  await newVehicle.save();
  res.json({});
};
module.exports.vehicle_list_get = async (req, res, next) => {
  let user = res.locals.user;

  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
  let makeFilter = req.body.makeFilter;
  let modelFilter = req.body.modelFilter;
  let plateFilter = req.body.plateFilter;

  let numPages = 1;

  let vehicles = [];

  let findData = {state: { $ne: 'removed' }};
  if (makeFilter != null) {
    findData.make = { "$regex": makeFilter, "$options": "i" };
  } else if (modelFilter != null) {
    findData.model = { "$regex": modelFilter, "$options": "i" };
  } else if (plateFilter != null) {
    findData.plate = { "$regex": plateFilter, "$options": "i" };
  }
  let numVehicles = await Vehicle.countDocuments(findData);
  numVehicles??=0;
  let limit = Math.abs(req.body.limit) || 8;
  numPages = Math.ceil(numVehicles / limit);
  let page = (Math.abs(req.body.page) || 0);
  page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));

  vehicles = await Vehicle.find(findData).sort({ createdAt: -1 }).limit(limit).skip(limit * page).lean().exec();
// console.log("numero de vehicles sea "+util.inspect(vehicles)+" asdasd "+util.inspect(findData)+" LOL "+numVehicles+" limit "+limit+"  "+page);
  res.json({ "vehicles": vehicles ?? [],numPages });
};
function clamp(num, min, max) {
  return num <= min 
    ? min 
    : num >= max 
      ? max 
      : num
}