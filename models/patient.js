const mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

let patientSchema=new mongoose.Schema({

    firstName:String,
    lastName:String,
    username:String,//email as username
    password:String,
    current_location:String,  //list of users -dropdown
    gender:String, //dropdown
    age:Number

});

patientSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Patient", patientSchema);