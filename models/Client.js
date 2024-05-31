const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
    dni:String ,
    name:String,
    phone:String,
    email:String,
    status:String,
});
module.exports = ClientSchema;