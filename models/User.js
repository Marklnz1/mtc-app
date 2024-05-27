const mongoose = require('mongoose');
const mongodb = require('../utils/mongodb');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:String,
    password:String,
    role:String,
    academyId:String

});
const db = mongodb.useDb("mtc_app", { useCache: true });
const User = db.model('user',userSchema,"user");
module.exports = User;