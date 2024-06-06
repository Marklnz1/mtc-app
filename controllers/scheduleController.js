const ScheduleSchema = require("../models/Schedule");
const VehicleSchema = require("../models/Vehicle");
const ClientSchema = require("../models/Client");

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
module.exports.schedule_vehicle_list = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  // if (user.academyId == null) {
  //   res.status(400).end();

  //   return;
  // }
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  // console.log("entre Xd"+req.body);  
  const date = new Date(req.body["date"]);

  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  const schedules = await Schedule.find({ date });
  const idsExcluidos = [];
  console.log("fecha " + date + " " + schedules);
  console.log("WTFFFFFFFFFFFFFFFFFF " + schedules);
  for (const s of schedules) {
    if (s.vehicle == "Alquilar") {
      continue;
    }
    idsExcluidos.push(s.vehicle);
  }
  const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);

  const vehicles = await Vehicle.find({ '_id': { $nin: idsExcluidos } }).lean()
    .exec();
  // console.log("vehiculos " + vehicles + "  " + vehicles.length);
  res.json({ "vehicles": vehicles });
};
module.exports.schedule_list_get = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  // if (user.academyId == null) {
  //   res.status(400).end();

  //   return;
  // }
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  // console.log("entre Xd"+req.body);
  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  getModelByTenant(academyId, "vehicle", VehicleSchema);
  // const Client = 
  getModelByTenant(academyId, "client", ClientSchema);
  let limit = Math.abs(req.query.limit) || 4;
  let page = (Math.abs(req.body.page) || 0);

  let nameFilter = req.body.nameFilter;
  let dniFilter = req.body.dniFilter;

  let numPages = 1;
  
  let numSchedules;
  let schedules;
  if (req.body["date"] != null) {
    const date = new Date(req.body["date"]);
    numSchedules  = await Schedule.countDocuments({ date });

    schedules = await Schedule.find({ date }).limit(limit).skip(limit * page).populate("vehicle").populate("client").lean().exec();
   
    console.log(schedules);

  } else if (req.body["clientId"] != null) {
    numSchedules  = await Schedule.countDocuments({ client: req.body["clientId"] });
    schedules = await Schedule.find({ client: req.body["clientId"] }).limit(limit).skip(limit * page).populate("vehicle").populate("client").lean().exec();
  } else if (req.body["vehicleId"] != null) {
    numSchedules  = await Schedule.countDocuments();

    schedules = await Schedule.find({ vehicle: req.body["vehicleId"] }).limit(limit).skip(limit * page).populate("client").lean().exec();

  } else {
    numSchedules  = await Schedule.countDocuments({ });
    schedules = await Schedule.find().populate("vehicle").limit(limit).skip(limit * page).populate("client").lean().exec();

  }
  numSchedules??=0;
  console.log("QUE FUEEEEEEEEE "+numSchedules);
  numPages = Math.ceil(numSchedules / limit);

  // for(const s of schedules){
  //   if(s.vehicleId!="Alquilar"){
  //     s.vehicle = await Vehicle.findById(s.vehicleId).lean().exec();
  //   }
  //   s.client = await Client.findById(s.clientId).lean().exec();
  // }
  console.log("HAY "+numPages);
  res.json({ "schedules": schedules,numPages });
};
module.exports.schedule_list_create = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
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
module.exports.schedule_range_get = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  const Vehicle = getModelByTenant(academyId, "vehicle", VehicleSchema);
  getModelByTenant(academyId, "client", ClientSchema);
  // if (user.academyId == null) {
  //   res.status(400).end();
  const startDate = new Date(req.body["startDate"]);
  const endDate = new Date(req.body["endDate"]);

  // const startDate =  new Date(); // Fecha de inicio
  // const endDate = new Date('2024-06-01'); // Fecha de fin

  const registros = await Schedule.find({
    date: {
      $gte: startDate, // Mayor o igual que la fecha de inicio
      $lte: endDate, // Menor o igual que la fecha de fin
    },
  }).populate("vehicle").populate("client").lean().exec();
  const numVehicles = await Vehicle.countDocuments({});
  //   return;
  // }
  console.log(registros + " LOLL " + startDate + " POOOOOOO " + endDate + " YALA " + startDate.toISOString);
  // console.log("entre Xd"+req.body);
  // await Schedule.insertMany(scheduleListData);
  res.json({ "schedules": registros, "numVehicles": numVehicles });
};
// module.exports.client_get = async (req, res, next) => {
//   let user = res.locals.user;
//   const clientDni = req.body.clientDni;
//   const academyId = user.academyId ?? "6654558ffee910176819a803";
//   const Client = getModelByTenant(academyId, "client", ClientSchema);
//   const client = await Client.findOne({ dni: clientDni }).lean().exec();
//   res.json({ "client": client});
// };
