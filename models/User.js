const mongoose = require('mongoose');
const mongodb = require('../utils/mongodb');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:String,
    password:String,
    role:String,
    academyId:String,    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

});
const db = mongodb.useDb("mtc_app", { useCache: true });
const User = db.model('user',userSchema,"user");
module.exports = User;