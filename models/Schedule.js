const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
    vehicleId:String ,
    clientId:String,
    date:Date
});
module.exports = ScheduleSchema;