const mongoose = require("mongoose");

let paymentSchema = new mongoose.Schema({
    
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
    status: String,
    txnid: String,
    amount: String,
    dateTime: String,
    cardNumber: String,
    payuMoneyId: String
});

module.exports = mongoose.model("Payment", paymentSchema);