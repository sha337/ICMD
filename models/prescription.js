const mongoose = require("mongoose");

let prescriptionSchema = new mongoose.Schema({
    
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
    medicines: [], 
    date: String
});

module.exports = mongoose.model("Prescription", prescriptionSchema);