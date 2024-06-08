const validator = require("validator");
const ClientSchema = require("../models/Client");
const { getModelByTenant } = require("../utils/tenant");
const util = require("util");
module.exports.client_create = async (req, res, next) => {
  try {
    const academyId = res.locals.user.academyId;
    const { dni, name, phone, email } = req.body ?? {};
    req.body = { dni, name, phone, email, state: "activo" };

    validateName(name);
    validatePhone(phone);
    await validateEmail(email, null, academyId);
    await validateDNI(dni, null, academyId);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  next();
};
module.exports.client_update = async (req, res, next) => {
  try {
    const academyId = res.locals.user.academyId;
    const { id, dni, name, phone, email } = req.body ?? {};
    req.body = { dni, name, phone, email };

    const client = await validateClientId(id, academyId);
    res.locals.client = client;
    validateName(name);
    validatePhone(phone);
    await validateEmail(email, id, academyId);
    await validateDNI(dni, id, academyId);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
};

function validateName(name) {
  if (typeof name !== "string" || validator.isEmpty(name)) {
    throw new Error("El nombre es invalido");
  }
  if (!validator.isAlpha(name, "es-ES", { ignore: " " })) {
    throw new Error("El Nombre solo debe contener letras");
  }
}
function validatePhone(phone) {
  if (typeof phone !== "string" || validator.isEmpty(phone)) {
    throw new Error("El telefono es invalido");
  }
  if (!validator.isLength(phone, { min: 9, max: 9 })) {
    throw new Error("El Telefono debe tener 9 digitos");
  }
  if (!validator.isNumeric(phone)) {
    throw new Error("El Telefono debe contener solo numeros");
  }
}
async function validateClientId(clientId, academyId) {
  let client;
  try {
    const Client = getModelByTenant(academyId, "client", ClientSchema);

    client = await Client.findById(clientId);
    if (client) {
      return client;
    }
  } catch (error) {
    throw new Error("Error al verificar al cliente");
  }
  if (!client) {
    throw new Error("No se encontro al cliente");
  }
}
async function validateDNI(dni, clientId, academyId) {
  if (typeof dni !== "string" || validator.isEmpty(dni)) {
    throw new Error("El DNI es invalido");
  }
  if (!validator.isLength(dni, { min: 8, max: 8 })) {
    throw new Error("El DNI debe tener 8 digitos");
  }
  if (!validator.isNumeric(dni)) {
    throw new Error("El DNI debe contener solo numeros");
  }
  let client;
  try {
    const Client = getModelByTenant(academyId, "client", ClientSchema);
    client = await Client.findOne({
      dni: dni,
      _id: { $ne: clientId },
    });
  } catch (error) {
    throw new Error("Error al verificar el DNI");
  }
  if (client) {
    throw new Error("El DNI le pertenece a otro Cliente");
  }
}
async function validateEmail(email, clientId, academyId) {
  if (email == null || (typeof email == "string" && email.trim().length == 0)) {
    return;
  }

  if (typeof email !== "string" || !validator.isEmail(email)) {
    throw new Error("El email es invalido");
  }
  let client;
  try {
    const Client = getModelByTenant(academyId, "client", ClientSchema);

    client = await Client.findOne({
      email: email,
      _id: { $ne: clientId },
    });
  } catch (error) {
    throw new Error("Error al verificar el email");
  }
  if (client) {
    throw new Error("El email le pertenece a otro Cliente");
  }
}
