const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    client:{type:String,ref:'client'},
    amount: Number,
    description: String
},{ timestamps: true });
module.exports = PaymentSchema;