const express       = require('express'),
      router        = express.Router(),
      jsSHA         = require("jssha"),
      request       = require('request'),
      uniqid        = require('uniqid'),
      User          = require("../models/user"),
      Meeting       = require("../models/meeting"),
      Payment       = require("../models/payment");


// this route handels the payment
router.post("/patient/:id/meeting/payment", isPatientLoggedIn, (req, res) => {
    // save doctors id to pass it to success url
    let docid = req.params.id;
    // save the meeting id for payment failure adn 
    let meetingid = "";


    let meetingdetails = {
        time: req.body.time,
        date: req.body.date
    };
    
    // creating a meeting in my database
    // Finding the doctor from database
    User.findById(req.params.id, (err, doctor)=>{
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
                    meetingid = meeting._id;
                    // adding patient details
                    meeting.patient.id = req.user._id;
                    meeting.patient.firstName = req.user.firstName;
                    meeting.patient.lastName = req.user.lastName;

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
                    });
                }
            });
        }
    });



    // ******************************Payment Handeling below*****************
    
    //Here save all the details in pay object
    const pay = {};
    pay.txnid            = uniqid.process();
    pay.amount           = req.body.amount;     // amount int text field, needs to be changed
    pay.productinfo      = "Payment for appointment";
    pay.firstname        = req.user.firstName;
    pay.email            = req.user.username;
    pay.udf1             = req.user.lastName;
    pay.udf2             = req.user.phoneNumber;
    pay.service_provider = "payu_paisa";

    // Creating hashstring
    const hashString = 'xQRSB1rh'   //process.env.key store in in different file
     + '|' + pay.txnid
     + '|' + pay.amount       
     + '|' + pay.productinfo 
     + '|' + pay.firstname
     + '|' + pay.email
     + '|' + pay.udf1   //lastname
     + '|' + pay.udf2   //phoneno.
     + '|' + '||||||||' 
     + 'ojB0LSS5kW'       //process.env.salt store in in different file

    const sha = new jsSHA('SHA-512', "TEXT");
    sha.update(hashString);

    //Getting hashed value from sha module
    const hash = sha.getHash("HEX");

    //We have to additionally pass merchant key to API
    //  so remember to include it.
    pay.key = "xQRSB1rh"     //process.env.key store in in different file;
    pay.surl = 'http://eb5553eafd17.ngrok.io/payment/success/'+docid;
    pay.furl = 'http://eb5553eafd17.ngrok.io/payment/fail';
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
            res.send({status: false, message:error.toString()});
        if (httpRes.statusCode === 200) {
            
            res.send(body);
        } 
        else if (httpRes.statusCode >= 300 && httpRes.statusCode <= 400) {
                
                res.redirect(httpRes.headers.location.toString());
        }
    });
});


// if payment successful, this route is called
router.post('/payment/success/:id', isPatientLoggedIn, (req, res) => {
    //Payumoney will send Success Transaction data to req body. 
    //  Based on the response Implement UI as per you want
    // console.log(req);
    let transaction = {};
    transaction.status      = req.body.status;
    transaction.txnid       = req.body.txnid;
    transaction.amount      = req.body.amount,
    transaction.dateTime    = req.body.addedon;
    transaction.cardNumber  = req.body.cardnum;
    transaction.payuMoneyId = req.body.payuMoneyId;

    // Finding the doctor from database
    User.findById(req.params.id, (err, doctor) => {
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            // Add payment details to database
            Payment.create(transaction, async(err, newTransaction) => {
                if(err){
                    console.log(err);
                    res.redirect("/");
                }else{

                    // *****************Payment details below********************

                    // adding patient details to transaction
                    newTransaction.patient.id = req.user._id;
                    newTransaction.patient.firstName = req.user.firstName;
                    newTransaction.patient.lastName = req.user.lastName;
        
                    // adding doctor details
                    newTransaction.doctor.id = doctor._id;
                    newTransaction.doctor.firstName = doctor.firstName;
                    newTransaction.doctor.lastName = doctor.lastName;
        
                    // update payment
                    newTransaction.save();
                    
                    // push newTransaction in doctors database
                    doctor.payments.push(newTransaction);
                    doctor.save();

                    // Finding the patient
                    User.findById(req.user._id, (err, patient)=>{
                        // push the meeting in patient DB
                        patient.payments.push(newTransaction);
                        patient.save();
                    });
                }
                console.log("**Payment done and added to patient and doc");
            });
        }
    });
    res.redirect("/patient/profile");
});


router.post('/payment/fail', (req, res) => {
    //Payumoney will send Fail Transaction data to req body. 
    //Based on the response Implement UI as per you want
    console.log("fail");
    res.send("Payment Failed");
});



// Middle ware
function isPatientLoggedIn(req, res, next){
    // console.log(req.user);
    if(req.isAuthenticated() && req.user.userType === 'patient'){
        return next();
    }
    req.logout();
    res.redirect("/patient/login");
}


module.exports = router;