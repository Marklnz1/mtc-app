const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VehicleSchema = new Schema({
    make:String,
    plate:String,
    model:String,
    description:String,
    type:String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }    
});
// const Vehicle = mongoose.model('vehicle',vehicleSchema,"vehicle");
module.exports = VehicleSchema;