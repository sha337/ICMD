const mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

//schema setup
var doctorSchema = new mongoose.Schema({
    username: String,   //use email as username
    firstName: String,
    lastName: String,
    phoneNumber: String,
    gender: String,
    age: String,
    mciLicense: String,
    specialization: String,
    referenceFirstName1: String,
    referenceLastName1: String,
    referenceEmail1: String,
    referencePhoneNumber1: String,
    referenceFirstName2: String,
    referenceLastName2: String,
    referenceEmail2: String,
    referencePhoneNumber2: String,
    password: String,
    joiningDate: {type: Date, default: Date.now},
    // comments: [
    //     {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Comment"
    //     }
    // ]
});

doctorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Doctor", doctorSchema);