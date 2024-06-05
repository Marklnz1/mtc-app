const ClientSchema = require("../models/Client");
const VehicleSchema = require("../models/Vehicle");
const util = require('util')
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
module.exports.client_create = async (req, res, next) => {
  let user = res.locals.user;
  // if (user.academyId == null) {
  //   res.status(400).end();

  //   return;
  // }
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  // console.log("entre Xd"+req.body);
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  const clientData = req.body;
  const newClient = new Client(clientData);
  console.log(util.inspect(newClient));
  await newClient.save();
  console.log(util.inspect(newClient));

  res.json({"client":newClient});
};
module.exports.schedule_list_get = async (req, res, next) => {
  let user = res.locals.user;
  const userData = req.body;

  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  const schedules = await Schedule.find({client:userData.clientId}).lean().exec();
  res.json({ "schedules": schedules ?? [] });
};
module.exports.schedule_list_remove = async (req, res, next) => {
  let user = res.locals.user;
  const scheduleIds = req.body.scheduleIds; 
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  await Schedule.deleteMany({ _id: { $in: scheduleIds } })
  res.status(200).end();

};

module.exports.client_list_get = async (req, res, next) => {
  let user = res.locals.user;

  const academyId = user.academyId ?? "6654558ffee910176819a803";
  // const clientIds =  req.body.clientIds; 
  // if(clientIds!=null){
  //   const Client = getModelByTenant(academyId, "client", ClientSchema);
  //   const clients = await Client.find({ '_id': { $in: clientIds } }).lean().exec();
  //   if( req.body.date!=null){
  //     const date = new Date( req.body.date);
  //     const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);

  //     for(const c of clients){
  //       c.vehicle = (await Schedule.findOne({date,clientId:c._id}).lean().exec())?.vehicleId;
  //     }
  //   }
   
  //   res.json({ "clients": clients ?? [] });
  // }else{
    const Client = getModelByTenant(academyId, "client", ClientSchema);
    const clients = await Client.find().lean().exec();
    res.json({ "clients": clients ?? [] });
  // }
 
};
module.exports.client_get = async (req, res, next) => {
  let user = res.locals.user;
  const clientDni = req.body.clientDni;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  const client = await Client.findOne({ dni: clientDni }).lean().exec();
  res.json({ "client": client});
};
