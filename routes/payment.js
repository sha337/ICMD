const meeting = require('../models/meeting');

const express       = require('express'),
      router        = express.Router(),
      jsSHA         = require("jssha"),
      request       = require('request'),
      uniqid        = require('uniqid'),
      User          = require("../models/user"),
      Meeting       = require("../models/meeting"),
      Payment       = require("../models/payment"),
      Token         = require("../models/token"),
      async = require('async'),
      await = require('await');



router.post('/payment_gateway/:id/payumoney', isPatientLoggedIn, async (req, res) => {
    // save doctors id and patient id to pass it to success url
    let doc_id = req.params.id;
    let pat_id = req.user._id;

    let meetingdetails = {
        time: req.body.time,
        date: req.body.date
    };

    // creating a meeting in my database
    // Finding the doctor from database
    User.findById(doc_id, (err, doctor)=>{
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            
            // Create a meeting in DB
            Meeting.create(meetingdetails, (err, meeting)=>{
                if(err){
                    counsole.log(err);
                    res.redirect("/");
                }else{
                    console.log(meeting);
                    meet_id = meeting._id;
                    
                    // adding patient details
                    meeting.patient.id        = req.user._id;
                    meeting.patient.firstName = req.user.firstName;
                    meeting.patient.lastName  = req.user.lastName;

                    // adding doctor details
                    meeting.doctor.id = doctor._id;
                    meeting.doctor.firstName = doctor.firstName;
                    meeting.doctor.lastName = doctor.lastName;

                    // update meeting
                    meeting.save();

                    // push meeting in doctors database
                    doctor.meetings.push(meeting);
                    doctor.save();

                    // Finding the patient
                    User.findById(req.user._id, (err, patient)=>{
                        // push the meeting in patient DB
                        patient.meetings.push(meeting);
                        patient.save();
                        console.log("Meeting Created");
                    });
                }
            });
        }
    })
    

    // ***************Payment Logic Below*******************

    //Here save all the details in pay object
    let pay = {};
    pay.txnid            = uniqid.process();
    pay.amount           = req.body.amount;
    pay.productinfo      = "Payment for appointment";
    pay.firstname        = req.user.firstName;
    pay.email            = req.user.username;
    pay.udf1             = req.user.lastName;
    pay.udf2             = req.user.phoneNumber;
    pay.service_provider = "payu_paisa";
    
    const hashString = "xQRSB1rh" //store in in different file
        + '|' + pay.txnid
        + '|' + pay.amount 
        + '|' + pay.productinfo 
        + '|' + pay.firstname
        + '|' + pay.email
        + '|' + pay.udf1   //lastname
        + '|' + pay.udf2   //phoneno.
        + '|' + '||||||||' 
        + "ojB0LSS5kW" //store in in different file
    const sha = new jsSHA('SHA-512', "TEXT");
    sha.update(hashString);
    //Getting hashed value from sha module
    const hash = sha.getHash("HEX");
        
    //We have to additionally pass merchant key to API
    //  so remember to include it.
    pay.key  = "xQRSB1rh" //store in in different file;
    pay.surl = 'http://bd6616fd8c55.ngrok.io/payment/success/'+doc_id+"/"+pat_id;
    pay.furl = 'http://bd6616fd8c55.ngrok.io/payment/fail';
    pay.hash = hash;
    //Making an HTTP/HTTPS call with request
    request.post({
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
        url: 'https://sandboxsecure.payu.in/_payment', //Testing url
        form: pay
    }, function (error, httpRes, body) {
    if (error) 
        res.send(
        {status: false, 
        message:error.toString()
        });
    if (httpRes.statusCode === 200) {
        res.send(body);
        } else if (httpRes.statusCode >= 300 && 
        httpRes.statusCode <= 400) {
        res.redirect(httpRes.headers.location.toString());
        }
    });
});
    


// if payment successful, this route is called
router.post('/payment/success/:doc_id/:pat_id',  async (req, res) => {
    //Payumoney will send Success Transaction data to req body. 
    //  Based on the response Implement UI as per you want
    
    // console.log(req.user);           undefined, dont know why
    
    let transaction = {};
    transaction.status      = req.body.status;
    transaction.txnid       = req.body.txnid;
    transaction.amount      = req.body.amount,
    transaction.dateTime    = req.body.addedon;
    transaction.cardNumber  = req.body.cardnum;
    transaction.payuMoneyId = req.body.payuMoneyId;

    // find the doctor from database
    await User.findById(req.params.doc_id, async (err, doctor) => {
        if(err){
            console.log(err);
            console.log("error in payment success while finding doctor");
            res.redirect("/");
        }else{
            // find the patient from data base
            await User.findById(req.params.pat_id, async (err, patient) => {
                if(err){
                    console.log(err);
                    console.log("error in payment success while finding patient");
                    res.redirect("/");
                }
                else{
                    await Payment.create(transaction, (err, newTransaction) => {
                        if(err){
                            console.log(err);
                            console.log("error in payment success while creating transaction");
                            res.redirect("/");
                        }else{
                            // adding patient details to transaction
                            newTransaction.patient.id = patient._id;
                            newTransaction.patient.firstName = patient.firstName;
                            newTransaction.patient.lastName = patient.lastName;
        
                            // adding doctor details to transaction
                            newTransaction.doctor.id = doctor._id;
                            newTransaction.doctor.firstName = doctor.firstName;
                            newTransaction.doctor.lastName = doctor.lastName;
        
                            // update payment
                            newTransaction.save();
        
                            // push newTransaction in doctors database
                            doctor.payments.push(newTransaction);
                            doctor.save();

                            // push the meeting in patient DB
                            patient.payments.push(newTransaction);
                            patient.save();
                        }
                    });
                }
            });  
            
            let meetings = doctor.meetings;
            let meet_id = meetings[meetings.length - 1]._id;
            res.redirect('/newmeeting/'+meet_id);   
        }
    });
});



router.post('/payment/fail', (req, res) => {
    console.log(req.body);
    res.send("payment Failed");
});



// Middle ware
function isPatientLoggedIn(req, res, next){
    // console.log(req.user);
    if(req.isAuthenticated() && req.user.userType === 'patient'){
        return next();
    }
    console.log("Patient was not logged in");
    req.logout();
    res.redirect("/patient/login");
}





module.exports = router;