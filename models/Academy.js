const mongoose = require('mongoose');
const mongodb = require('../utils/mongodb');

const Schema = mongoose.Schema;

const academySchema = new Schema({
    name:String,
    description:String
});
const db = mongodb.useDb("mtc_app", { useCache: true });
const Academy = db.model('academy',academySchema,"academy");

module.exports = Academy;