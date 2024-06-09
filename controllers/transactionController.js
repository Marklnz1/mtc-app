const DebtSchema = require("../models/Debt");
const PaymentSchema = require("../models/Payment");
const ClientSchema = require("../models/Client");
const util = require("util");

const { getModelByTenant } = require("../utils/tenant");

module.exports.payment_delete = async (req, res, next) => {
  try {
    const academyId = res.locals.user.academyId;
    const Payment = getModelByTenant(academyId, "payment", PaymentSchema);
    await Payment.findOneAndUpdate(
      { _id: req.body.paymentId },
      { state: "removed" }
    );
    res.status(200).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports.debt_create = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";

  const debt = req.body["debt"];
  debt.type = "deuda";
  const payment = req.body["payment"];
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  const client = await Client.findById(debt.client);

  const Debt = getModelByTenant(academyId, "debt", DebtSchema);
  debt.amount -= payment.amount;
  console.log("DATOS DE LA DEUDA " + util.inspect(debt));
  const newDebt = new Debt(debt);
  await newDebt.save();
  if (client != null) {
    if (client.debts == null) {
      client.debts = [];
    }
    client.debts.unshift(newDebt._id);
    await client.save();
  }

  const Payment = getModelByTenant(academyId, "payment", PaymentSchema);
  const newPayment = new Payment({
    debt: newDebt._id,
    client: debt.client,
    amount: payment.amount,
    description: debt.description,
    type: "pago",
  });
  await newPayment.save();

  if (client != null) {
    if (client.payments == null) {
      client.payments = [];
    }
    client.payments.unshift(newPayment._id);
    await client.save();
  }

  // console.log("entre Xd"+req.body);

  res.status(200).end();
};
module.exports.payment_update = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const paymentData = req.body["paymentData"];

  const clientDni = req.body["clientDni"];
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  if (clientDni == null) {
    console.log("sin registro ");
    res.json({ error: "No ingreso ningun DNI" });
    return;
  }
  const client = await Client.findOne({ dni: clientDni });
  // console.log("ENSERIO CLIENTE ???? "+clientDni+"   a"+ util.inspect(client)+" clients "+await Client.find());
  if (client == null) {
    console.log("NO EXISTEEEEEEEEEEEEEE");
    res.json({ error: "El DNI no esta registrado" });
  } else {
    const paymentId = paymentData.id;
    const Payment = getModelByTenant(academyId, "payment", PaymentSchema);
    await Payment.findOneAndUpdate(
      { _id: paymentId },
      {
        amount: paymentData.amount,
        description: paymentData.description,
        client: client._id,
      }
    );

    res.json({});
  }
};
module.exports.payment_create = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";

  const debtId = req.body["debt"];
  const payment = req.body;
  const Debt = getModelByTenant(academyId, "debt", DebtSchema);
  const debtDB = await Debt.findById(debtId);

  debtDB.amount -= payment.amount;
  await debtDB.save();

  // console.log("entre Xd"+req.body);
  const Payment = getModelByTenant(academyId, "payment", PaymentSchema);

  const newPayment = new Payment({
    debt: debtDB._id,
    client: debtDB.client,
    amount: payment.amount,
    description: payment.description,
  });
  await newPayment.save();
  const Client = getModelByTenant(academyId, "client", PaymentSchema);
  const client = await Client.findById(debtDB.client);
  client.payments ??= [];
  client.payments.unshift(newPayment._id);
  await client.save();
  res.status(200).end();
};
module.exports.debt_list = async (req, res, next) => {
  console.log("ENTRANDO " + req.body);
  let user = res.locals.user;
  const academyId = user.academyId ?? "6654558ffee910176819a803";
  const Debt = getModelByTenant(academyId, "debt", DebtSchema);
  const Client = getModelByTenant(academyId, "client", ClientSchema);
  let dniFilter = req.body.dniFilter;

  let numPages = 1;

  let findData = {};
  let debts = [];
  if (dniFilter != null) {
    console.log("entrando?? :V Xd 111111111111");

    const client = await Client.findOne({
      dni: dniFilter,
      state: { $ne: "removed" },
    })
      .populate("debts")
      .lean()
      .exec();
    if (client != null && client.debts != null) {
      debts = client.debts;
      client.debts = null;
      for (const p of debts) {
        p.client = client;
      }
    }
    // console.log("entrando?? :V Xd " + util.inspect(debts));
  } else {
    let numPayments = await Debt.countDocuments({ state: { $ne: "removed" } });
    let limit = Math.abs(req.query.limit) || 8;
    numPages = Math.ceil(numPayments / limit);

    let page = Math.abs(req.body.page) || 0;
    page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));
    debts = await Debt.find({ state: { $ne: "removed" } })
      .populate("client")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .lean()
      .exec();
    // console.log("payments "+await Payment.find());
  }

  console.log("DEUDAS  " + util.inspect(debts));
  res.json({ debts, numPages });
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

  let findData = { state: { $ne: "removed" } };
  let payments = [];
  if (dniFilter != null) {
    console.log("entrando?? :V Xd 111111111111");

    const client = await Client.findOne({
      dni: dniFilter,
      state: { $ne: "removed" },
    })
      .populate("payments")
      .lean()
      .exec();
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
    findData.name = { $regex: nameFilter, $options: "i" };

    const response = await Client.aggregate([
      { $match: findData }, // Filtra por DNI
      {
        $group: {
          _id: null,
          totalItems: { $sum: { $size: { $ifNull: ["$payments", []] } } },
        },
      }, // Suma el tamaño de la lista 'items'
    ]);

    const numPayments = response[0]?.totalItems ?? 0;

    console.log("HAY  " + numPayments);
    let limit = Math.abs(req.query.limit) || 8;
    numPages = Math.ceil(numPayments / limit);

    let page = Math.abs(req.body.page) || 0;
    page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));
    let clients = await Client.find(findData)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .populate("payments")
      .lean()
      .exec();
    clients = clients ?? [];
    for (const c of clients) {
      if (c.payments != null) {
        const clientPayments = c.payments;
        payments.push(...clientPayments);
        c.payments = null;
        for (const p of clientPayments) {
          p.client = c;
        }
      }
    }
  } else {
    let numPayments = await Payment.countDocuments({
      state: { $ne: "removed" },
    });
    let limit = Math.abs(req.query.limit) || 8;
    numPages = Math.ceil(numPayments / limit);

    let page = Math.abs(req.body.page) || 0;
    page = clamp(page, 0, clamp(numPages - 1, 0, Number.MAX_SAFE_INTEGER));
    console.log(
      "HAY  " +
        numPayments +
        " page " +
        page +
        " numPages: " +
        numPages +
        " limit " +
        limit
    );

    payments = await Payment.find({ state: { $ne: "removed" } })
      .populate("client")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .lean()
      .exec();
    // console.log("payments "+await Payment.find());
  }

  console.log("PAGOS  " + util.inspect(payments));
  res.json({ payments, numPages });
};
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
