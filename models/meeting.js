const mongoose = require("mongoose");

let meetingSchema = new mongoose.Schema({
    
    patient: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        firstName: String,
        lastName: String
    },
    doctor: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        firstName: String,
        lastName: String
    },
    time: String,
    date: String 
});

module.exports = mongoose.model("Meeting", meetingSchema);