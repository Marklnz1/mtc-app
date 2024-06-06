
const DebtSchema = require("../models/Debt");
const PaymentSchema = require("../models/Payment");
const ClientSchema = require("../models/Client");
const util = require('util')

const { getModelByTenant } = require("../utils/tenant");
module.exports.debt_create = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";

  const debt = req.body["debt"];
  const payment = req.body["payment"];
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  const client = await Client.findById(debt.clientId);
  if (payment != null) {
    debt.amount -= payment.amount;
    const Payment = getModelByTenant(academyId, "payment", PaymentSchema);
    const newPayment = new Payment({ client: debt.clientId, amount: payment.amount, description: debt.description });
    await newPayment.save();

    if (client != null) {
      if (client.payments == null) {
        client.payments = [];
      }
      client.payments.push(newPayment._id);
      await client.save();

    }

  }
  // console.log("entre Xd"+req.body);
  const Debt = getModelByTenant(academyId, "debt", DebtSchema);
  const newDebt = new Debt(debt);
  await newDebt.save();
  if (client != null) {
    if (client.debts == null) {
      client.debts = [];
    }
    client.debts.push(newDebt._id);
    await client.save();
  }
  res.status(200).end();
};

module.exports.payment_create = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";

  const debt = req.body["debt"];
  const payment = req.body["payment"];
  if (debt != null) {
    debt.amount -= payment.amount;
    const Debt = getModelByTenant(academyId, "debt", DebtSchema);
    const debtDB = await Debt.findById(debt.id);
    debtDB.amount -= payment.amount;
    await debtDB.save();
  }
  // console.log("entre Xd"+req.body);
  const Payment = getModelByTenant(academyId, "payment", PaymentSchema);

  const newPayment = new Payment({ client: payment.clientId, amount: payment.amount, description: payment.description });
  await newPayment.save();
  res.status(200).end();
};

module.exports.payment_list = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Payment = getModelByTenant(academyId, "payment", PaymentSchema);
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  let nameFilter = req.body.nameFilter;
  let dniFilter = req.body.dniFilter;

  let numPages = 1;


  let findData = {};
  let payments = [];
  if (dniFilter != null) {
    console.log("entrando?? :V Xd 111111111111");

    const client = await Client.findOne({ "dni": dniFilter }).populate("payments").lean().exec();
    console.log("si sisisisisisis " + util.inspect(client));
    if (client != null && client.payments != null) {
      payments = client.payments;
      client.payments = null;
      for (const p of payments) {
        p.client = client;
      }
    }
    console.log("entrando?? :V Xd " + util.inspect(payments));
  } else if (nameFilter != null) {


    findData.name = { "$regex": nameFilter, "$options": "i" };

    const response = await Client.aggregate([
      { $match: findData }, // Filtra por DNI
      { $group: { _id: null, totalItems: { $sum: { $size: { "$ifNull": [ "$payments", [] ] } } } } } // Suma el tamaño de la lista 'items'
    ]);

    const numPayments = response[0]?.totalItems ?? 0;

    console.log("HAY  " + numPayments);
    let limit = Math.abs(req.query.limit) || 8;
    numPages = Math.ceil(numPayments / limit);


    let page = (Math.abs(req.body.page) || 0);
    page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));
    let clients = await Client.find(findData).sort({ createdAt: -1 }).limit(limit).skip(limit * page).populate("payments").lean().exec();
    clients = clients??[];
    for(const c of clients){
      if ( c.payments != null) {
        payments.push(...c.payments);
        c.payments = null;
        for (const p of payments) {
          p.client = c;
        }
      }
    }
  } else {
    let numPayments = await Payment.countDocuments();
    let limit = Math.abs(req.query.limit) || 8;
    numPages = Math.ceil(numPayments / limit);


    let page = (Math.abs(req.body.page) || 0);
    page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));
    console.log("HAY  "+numPayments+" page "+page+" numPages: "+numPages+" limit "+limit);

    payments = await Payment.find().populate("client").sort({ createdAt: -1 }).limit(limit).skip(limit * page).lean().exec();
    
  }


  console.log("PAGOS  " + util.inspect(payments));
  res.json({ "payments": payments, numPages });
};
function clamp(num, min, max) {
  return num <= min
    ? min
    : num >= max
      ? max
      : num
}