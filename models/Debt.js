const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DebtSchema = new Schema({
    client:{type:String,ref:'client'},
    amount: Number,
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
module.exports = DebtSchema;