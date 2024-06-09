const ClientSchema = require("../models/Client");
const VehicleSchema = require("../models/Vehicle");
const util = require("util");
const ScheduleSchema = require("../models/Schedule");

const { getModelByTenant } = require("../utils/tenant");
module.exports.client_create = async (req, res, next) => {
  try {
    const academyId = res.locals.user.academyId;
    const Client = getModelByTenant(academyId, "client", ClientSchema);
    const newClient = await Client.create(req.body);
    res.status(200).json({ client: newClient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.client_read = async (req, res, next) => {
  try {
    const academyId = res.locals.user.academyId;
    const Client = getModelByTenant(academyId, "client", ClientSchema);
    const client = await Client.findOne({
      dni: req.body.clientDni,
      state: { $ne: "removed" },
    });
    res.status(200).json({ client });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports.client_update = async (req, res, next) => {
  try {
    const client = res.locals.client;
    client.set({ ...req.body });
    await client.save();
    res.status(200).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports.client_delete = async (req, res, next) => {
  try {
    const academyId = res.locals.user.academyId;
    const Client = getModelByTenant(academyId, "client", ClientSchema);
    await Client.findOneAndUpdate(
      { _id: req.body.clientId },
      { state: "removed" }
    );
    res.status(200).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.client_list_get = async (req, res, next) => {
  try {
    let data = req.body;
    const academyId = res.locals.user.academyId;
    const Client = getModelByTenant(academyId, "client", ClientSchema);

    let findData = { state: { $ne: "removed" } };

    if (data.nameFilter != null) {
      findData.name = { $regex: data.nameFilter, $options: "i" };
    }
    let numClients = (await Client.countDocuments(findData)) ?? 0;
    let limit = Math.abs(data.limit) || 8;
    let numPages = Math.ceil(numClients / limit);
    let page = fixedPage(data.page);

    let clients = await Client.find(findData)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .lean()
      .exec();
    res.status(200).json({
      clients: clients ?? [],
      numPages,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
function fixedPage(page, numPages) {
  page = Math.abs(page) || 0;
  page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));
  return page;
}
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

//=======================================================================================
module.exports.schedule_list_get = async (req, res, next) => {
  let user = res.locals.user;
  const userData = req.body;

  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  const schedules = await Schedule.find({ client: userData.clientId })
    .lean()
    .exec();
  console.log("tamañoooooooo " + schedules.length);
  res.json({ schedules: schedules ?? [] });
};
module.exports.schedule_list_remove = async (req, res, next) => {
  let user = res.locals.user;
  const scheduleIds = req.body.scheduleIds;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Schedule = getModelByTenant(academyId, "schedule", ScheduleSchema);
  await Schedule.deleteMany({ _id: { $in: scheduleIds } });
  res.status(200).end();
};
