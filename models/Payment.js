const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    client: { type: String, ref: "client" },
    debt: { type: String, ref: "debt" },
    amount: Number,
    description: String,
    type: String,
    state: String,
  },
  { timestamps: true }
);
module.exports = PaymentSchema;
