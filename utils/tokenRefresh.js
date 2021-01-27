let clientID = process.env.ZOOM_CLIENT_ID;
let clientSecret = process.env.ZOOM_CLIENT_SECRET;
const Token      = require("../models/token");
const request    = require("request");


// function to refresh the access_token
function tokenRefresh(){
    console.log("Refresh token function called");
    Token.findOne({id:'1'}, (err, token)=>{
        var options = {
            method: 'POST',
            url: 'https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token='+token.refresh_token,
            headers: {
                authorization: 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64')
            }
        };
        request(options, function (error, response, body) {
            body = JSON.parse(body);
            if(error)   throw new Error(error);
            else{
                token.access_token = body.access_token;
                token.refresh_token = body.refresh_token;
                token.save();
                console.log("**token refreshed**");
            }
            
        });
    });
}

module.exports = tokenRefresh;