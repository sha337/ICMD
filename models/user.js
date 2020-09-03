const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    // Common to all three - patient, doctor, admin
    username:String,    //email as username
    firstName:String,
    lastName:String,
    password:String,
    gender:String,      //dropdown
    age:Number,
    phoneNumber: String,
    userType: String,
    profileImage:String,
    joiningDate: {type: Date, default: Date.now},

    // Specific to Doctors Only
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

    // meetings attended
    meetings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meeting"
        }
    ],

    // payments done by patient/ ( or for which doctor )
    payments : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);