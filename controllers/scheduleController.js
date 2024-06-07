const ScheduleSchema = require("../models/Schedule");
const VehicleSchema = require("../models/Vehicle");
const ClientSchema = require("../models/Client");
const util = require('util')

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
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  let limit = Math.abs(req.query.limit) || 4;
  let page = (Math.abs(req.body.page) || 0);
  console.log("PAGINA INICIAL " + page);
  let nameFilter = req.body.nameFilter;
  let dniFilter = req.body.dniFilter;

  let numPages = 1;

  let numSchedules;
  let findData = {};
  let schedules = [];
  if (dniFilter != null) {
    console.log("entrando?? :V Xd 111111111111");

    const client = await Client.findOne({ "dni": dniFilter }).populate({
      path: 'schedules',
      populate: {
        path: 'vehicle'
      }
    }).lean().exec();
    console.log("si sisisisisisis " + util.inspect(client));
    if (client != null && client.schedules != null) {
      schedules = client.schedules.filter(Boolean);
      client.schedules = null;
      for (const p of schedules) {
        p.client = client;
      }
    }
    console.log("entrando?? :V Xd " + util.inspect(schedules));
  } else if (nameFilter != null) {


    findData.name = { "$regex": nameFilter, "$options": "i" };

    const response = await Client.aggregate([
      { $match: findData }, // Filtra por DNI
      { $group: { _id: null, totalItems: { $sum: { $size: { "$ifNull": ["$schedules", []] } } } } } // Suma el tamaño de la lista 'items'
    ]);

    numSchedules = response[0]?.totalItems ?? 0;

    console.log("HAY  " + numSchedules);
    let limit = Math.abs(req.query.limit) || 8;
    numPages = Math.ceil(numSchedules / limit);


    let page = (Math.abs(req.body.page) || 0);
    page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));
    let clients = await Client.find(findData).sort({ createdAt: -1 }).limit(limit).skip(limit * page).populate("schedules").lean().exec();
    clients = clients ?? [];
    // console.log("SE ENCONTROOOOOOOO "+util.inspect(clients));
    for (const c of clients) {
      if (c.schedules != null) {
        const clientSchedules = c.schedules;
        schedules.push(...clientSchedules);
        c.schedules = null;
        for (const s of clientSchedules) {
          s.client = c;
        }
      }
    }
  } else if (req.body["date"] != null) {
    const date = new Date(req.body["date"]);
    numSchedules = await Schedule.countDocuments({ date });

    schedules = await Schedule.find({ date }).limit(limit).skip(limit * page).populate("vehicle").populate("client").lean().exec();

    console.log(schedules);

  } else if (req.body["clientId"] != null) {
    numSchedules = await Schedule.countDocuments({ client: req.body["clientId"] });
    schedules = await Schedule.find({ client: req.body["clientId"] }).limit(limit).skip(limit * page).populate("vehicle").populate("client").lean().exec();
  } else if (req.body["vehicleId"] != null) {
    numSchedules = await Schedule.countDocuments();

    schedules = await Schedule.find({ vehicle: req.body["vehicleId"] }).limit(limit).skip(limit * page).populate("client").lean().exec();

  } else {
    numSchedules = await Schedule.countDocuments({});
    schedules = await Schedule.find().populate("vehicle").limit(limit).skip(limit * page).populate("client").lean().exec();

  }
  numSchedules ??= 0;
  console.log("QUE FUEEEEEEEEE " + numSchedules);
  numPages = Math.ceil(numSchedules / limit);

  // for(const s of schedules){
  //   if(s.vehicleId!="Alquilar"){
  //     s.vehicle = await Vehicle.findById(s.vehicleId).lean().exec();
  //   }
  //   s.client = await Client.findById(s.clientId).lean().exec();
  // }
  console.log("HAY " + numPages + " schedules: " + numSchedules + "  page " + page + " limit : " + limit);
  res.json({ "schedules": schedules, numPages });
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
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  const scheduleListData = req.body["schedules"];

  const schedulesDB = await Schedule.insertMany(scheduleListData);

  if (scheduleListData.length != 0) {
    const client = await Client.findById(scheduleListData[0].client);
    if (client != null) {
      if (client.schedules == null) {
        client.schedules = [];
      }
      for (const schedule of schedulesDB) {
        client.schedules.push(schedule._id);
      }
      await client.save();
    }
  }
  console.log("se creo " + util.inspect(schedulesDB));
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
function clamp(num, min, max) {
  return num <= min
    ? min
    : num >= max
      ? max
      : num
}