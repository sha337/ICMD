// Bring in environment secrets through dotenv
// require('dotenv/config')

const express       = require('express'),
      router        = express.Router(),
      request       = require('request'),
      Meeting       = require("../models/meeting"),
      Token         = require("../models/token"),
      tokenRefresh  = require('../utils/tokenRefresh');

let clientID='F_D07LjfTkSnldN9VZd6TA';
let clientSecret='EBnErrJ9JNXWRNdFzcWpotI2mzTHc1ya';
let redirectURL='http://iconsultmydoctor.herokuapp.com/gettoken';

// this route generates the access token and refresh token ( used only if server goes to sleep )
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

            // Logs your access and refresh tokens
            console.log(`access_token: ${body.access_token}`);
            console.log(`refresh_token: ${body.refresh_token}`);
            
            // save the token in database
            Token.findOne({id: "1"}, (err, token)=>{
                if(err){
                    console.log(err);
                    res.redirect('/');
                }else{
                    token.access_token = body.access_token;
                    token.refresh_token = body.refresh_token;
                    token.save();
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
router.get('/newmeeting/:meet_id', async (req, res) => {
// finding the access token from database
    let meeting = await Meeting.findById(req.params.meet_id);
    let meeting_date_time = meeting.date + "T" + meeting.time;
    console.log(meeting_date_time);
    Token.findOne({id:'1'}, (err, token)=>{
        // object containing the API url, headers and details of meeting(body) 
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
                start_time: meeting_date_time,    // meeting start time
                duration: 60,                       // 30 minutes
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

        // sending post request to zoom API to generate meeting link
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
                meeting.link = body.join_url;
                meeting.payment = true;
                meeting.save();
                console.log(body);
                res.redirect("/patient/profile");
            }
            
        });  
    });
});



// calling refresh token after every 20mins
setInterval(tokenRefresh, 20*60*1000);




module.exports = router;