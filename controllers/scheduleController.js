const ScheduleSchema = require("../models/Schedule");
const { getModelByTenant } = require("../utils/tenant");

// module.exports.vehicle_remove = async (req, res, next) => {
//   let user = res.locals.user;
//   const academyId= user.academyId??"6654558ffee910176819a803";
//   const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
//   const vehicleData = req.body;
//   const newVehicle = new Vehicle(vehicleData);
//   await newVehicle.save();
//   res.status(200).end();
// };
module.exports.schedule_list_create = async (req, res, next) => {
  console.log("ENTRANDO "+req.body);
  let user = res.locals.user;
  // if (user.academyId == null) {
  //   res.status(400).end();

  //   return;
  // }
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  // console.log("entre Xd"+req.body);
  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  const scheduleListData = req.body["schedules"];
  await Schedule.insertMany(scheduleListData);
  res.status(200).end();
};

// module.exports.client_get = async (req, res, next) => {
//   let user = res.locals.user;
//   const clientDni = req.body.clientDni;
//   const academyId = user.academyId ?? "6654558ffee910176819a803";
//   const Client = getModelByTenant(academyId, "client", ClientSchema);
//   const client = await Client.findOne({ dni: clientDni }).lean().exec();
//   res.json({ "client": client});
// };
