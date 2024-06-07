const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
    dni:String ,
    name:String,
    phone:String,
    email:String,
    state:String,
    payments:[{type:String,ref:'payment'}],
    debts:[{type:String,ref:'debt'}],
    schedules:[{type:String,ref:'schedule'}]
},{ timestamps: true });
module.exports = ClientSchema;