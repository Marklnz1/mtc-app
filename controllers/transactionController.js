
const DebtSchema = require("../models/Debt");
const PaymentSchema = require("../models/Payment");
const ClientSchema = require("../models/Client");
const { getModelByTenant } = require("../utils/tenant");
module.exports.debt_create = async (req, res, next) => {
    console.log("ENTRANDO "+req.body);
    let user = res.locals.user;
    const academyId = user.academyId ?? "6654558ffee910176819a803";

    const debt = req.body["debt"];
    const payment = req.body["payment"];
    if(payment!=null){
        debt.amount-=payment.amount;
        const Payment = getModelByTenant(academyId, "payment", PaymentSchema);
        const newPayment = new Payment({clientId:debt.clientId,amount:payment.amount,description:debt.description});
        await newPayment.save();
    }
    // console.log("entre Xd"+req.body);
    const Debt = getModelByTenant(academyId, "debt", DebtSchema);
    const newDebt = new Debt(debt);
    await newDebt.save();
    res.status(200).end();
  };

  module.exports.payment_create = async (req, res, next) => {
    console.log("ENTRANDO "+req.body);
    let user = res.locals.user;
    const academyId = user.academyId ?? "6654558ffee910176819a803";

    const debt = req.body["debt"];
    const payment = req.body["payment"];
    if(debt!=null){
        debt.amount-=payment.amount;
        const Debt = getModelByTenant(academyId, "debt", DebtSchema);
        const debtDB = await Debt.findById(debt.id);
        debtDB.amount-=payment.amount;
        await debtDB.save();
    }
    // console.log("entre Xd"+req.body);
    const Payment = getModelByTenant(academyId, "payment", PaymentSchema);

    const newPayment = new Payment({clientId:payment.clientId,amount:payment.amount,description:payment.description});
    await newPayment.save();
    res.status(200).end();
  };

  module.exports.payment_list = async (req, res, next) => {
    console.log("ENTRANDO "+req.body);
    let user = res.locals.user;
    const academyId = user.academyId ?? "6654558ffee910176819a803";
    const Payment = getModelByTenant(academyId, "payment", PaymentSchema);
    const payments = await Payment.find().lean().exec();
    const Client = getModelByTenant(academyId, "client", ClientSchema);

    for(const p of payments){
        p.client = await Client.findById(p.clientId).lean().exec();
    }
    res.json({"payments":payments});
  };
