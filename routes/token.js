// Bring in environment secrets through dotenv
// require('dotenv/config')

const express       = require('express'),
      router        = express.Router(),
      request       = require('request'),
      Meeting       = require("../models/meeting"),
      Token         = require("../models/token");

let clientID='F_D07LjfTkSnldN9VZd6TA';
let clientSecret='EBnErrJ9JNXWRNdFzcWpotI2mzTHc1ya';
let redirectURL='http://iconsultmydoctor.herokuapp.com/gettoken';

router.get('/gettoken', (req, res) => {
    // Step 1: 
    // Check if the code parameter is in the url 
    // if an authorization code is available, the user has most likely been redirected from Zoom OAuth
    // if not, the user needs to be redirected to Zoom OAuth to authorize
    if (req.query.code) {
        console.log("Got the code");
        // Step 3: 
        // Request an access token using the auth code
        let url = 'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + redirectURL;

        request.post(url, (error, response, body) => {
            console.log("got the tokens");
            // Parse response to JSON
            body = JSON.parse(body);

            // Logs your access and refresh tokens in the browser
            console.log(`access_token: ${body.access_token}`);
            console.log(`refresh_token: ${body.refresh_token}`);
            
            // save the token in database
            let tokenDetails = {
                id: "1",
                access_token: body.access_token,
                refresh_token: body.refresh_token
            };
            console.log("Adding to database");
            Token.create(tokenDetails, (err, token)=>{
                if(err){
                    console.log(err);
                    res.redirect('/');
                }else{
                    console.log("token added to databse");
                    res.redirect('/');
                }
            });
        }).auth(clientID, clientSecret);
        
        return;
    }

    // Step 2: 
    // If no authorization code is available, redirect to Zoom OAuth to authorize
    res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + clientID + '&redirect_uri=' + redirectURL)
});

// this route genrates zoom meeting link
router.get('/newmeeting/:meet_id', (req, res) => {

    Token.findOne({id:'1'}, (err, token)=>{
        
        let options = {
            method: 'POST',
            url: 'https://api.zoom.us/v2/users/shabbaralee@gmail.com/meetings',
            headers: {
                'content-type': 'application/json',
                authorization: 'Bearer ' + token.access_token
            },
            body: {
                topic: "Doctor Consultation",
                type: 2,                              
                start_time: "2020-09-11T22:32:00",    // meeting start time
                duration: 30,                       // 30 minutes
                password: "123456",
                setting: {
                    waiting_room: false,
                    join_before_host: true,
                    approval_type: 0,   // 0 is for automatic approval
                    contact_name: "Shabbar Ali",
                    contact_email: "shabbaralee@gmail.com",
                    registrants_confirmation_email: true,
                    registrants_email_notification: true
                } 
            },
            json: true
        };

        request(options, function(error, response, body) {
            // Parse response to JSON
            // body = JSON.parse(body);
            // console.log(body.join_url);
            // console.log("inside request");
            if (error){
                console.log(error);
                throw new Error(error);
            }  
            else{
                Meeting.findById(req.params.meet_id, (err, meeting)=>{
                    console.log("before:");
                    console.log(meeting);
                    meeting.link = body.join_url;
                    meeting.save();
                    console.log("after:");
                    console.log(meeting);
                });
                // console.log(body);
                res.redirect("/patient/profile");
            }
            
        });  
    });
});


function refreshToken(){
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

setInterval(refreshToken, 20*60*1000);




module.exports = router;