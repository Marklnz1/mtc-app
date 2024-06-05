const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
    vehicle:{type:String,ref:'vehicle'} ,
    client:{type:String,ref:'client'},
    date:Date
});
module.exports = ScheduleSchema;