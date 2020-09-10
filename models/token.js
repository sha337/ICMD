const mongoose = require("mongoose");

let tokenSchema = new mongoose.Schema({
    id: String,
    access_token: String,
    refresh_token: String
});

module.exports = mongoose.model("Token", tokenSchema);