const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
    dni:String ,
    name:String,
    phone:String,
    email:String,
    status:String,
    payments:[{type:String,ref:'payment'}],
    debts:[{type:String,ref:'debt'}],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }  
});
module.exports = ClientSchema;