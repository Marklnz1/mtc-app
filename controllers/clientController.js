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
module.exports.client_delete = async (req, res, next) => {
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  const clientId = req.body.clientId;
  const state = "removed";
  await Client.findOneAndUpdate({ _id: clientId }, { state });
  console.log("ELIMINANDO ????? " + clientId);
  res.json({});
};
module.exports.client_update = async (req, res, next) => {
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  const clientId = req.body.clientId;
  const clientData = req.body.clientData;
  const client = await Client.findById(clientId);
  if (client.dni.trim() != clientData.dni.trim()) {
    const clientClone = await Client.findOne({ dni: clientData.dni ,state: { $ne: 'removed' }});
    if (clientClone != null) {
      res.json({ "error": "El DNI le pertenece a otro Cliente" })
      return;
    }
  }
  await Client.findOneAndUpdate({ _id: clientId }, clientData);
  console.log("ACTUALIZANDO ????? " + clientId + "  data " + util.inspect(clientData));
  res.json({});
};
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
  const clientClone = await Client.findOne({ dni: clientData.dni.trim() ,state: { $ne: 'removed' }});
  if (clientClone != null) {
    res.json({ "error": "El DNI le pertenece a otro Cliente" })
    return;
  }

  const newClient = new Client(clientData);
  console.log(util.inspect(newClient));
  await newClient.save();
  console.log(util.inspect(newClient));

  res.json({ "client": newClient });
};
module.exports.schedule_list_get = async (req, res, next) => {
  let user = res.locals.user;
  const userData = req.body;

  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  const schedules = await Schedule.find({ client: userData.clientId }).lean().exec();
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

  const Client = getModelByTenant(academyId, "client", ClientSchema);
  let nameFilter = req.body.nameFilter;
  let dniFilter = req.body.dniFilter;

  let numPages = 1;

  let clients = [];

  let findData = { state: { $ne: 'removed' } };

  if (dniFilter != null) {
    console.log("entrando?? :V Xd 111111111111");
    findData.dni = dniFilter;
    const client = await Client.findOne(findData).lean().exec();
    if (client != null) {
      clients = [client];
    }
    console.log("entrando?? :V Xd " + clients);
  } else {

    if (nameFilter != null) {
      findData.name = { "$regex": nameFilter, "$options": "i" };
    }
    let numClients = await Client.countDocuments(findData);
    numClients ??= 0;

    console.log("HAY  " + numClients + "lol " + util.inspect(findData));
    let limit = Math.abs(req.query.limit) || 8;
    numPages = Math.ceil(numClients / limit);


    let page = (Math.abs(req.body.page) || 0);
    page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));
    clients = await Client.find(findData).sort({ createdAt: -1 }).limit(limit).skip(limit * page).lean().exec();
  }
  console.log("devolviendoooooooooooooo  " + numPages + "  " + clients);



  res.json({ "clients": clients ?? [], numPages });

};
module.exports.client_get = async (req, res, next) => {
  let user = res.locals.user;
  const clientDni = req.body.clientDni;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  const client = await Client.findOne({ dni: clientDni }).lean().exec();
  res.json({ "client": client });
};
function clamp(num, min, max) {
  return num <= min
    ? min
    : num >= max
      ? max
      : num
}