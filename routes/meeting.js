const express       = require('express'),
      router        = express.Router(),
      User          = require("../models/user"),
      Meeting       = require("../models/meeting");


// Create a meeting route
router.post("/patient/:id/meeting", isPatientLoggedIn, (req,res) =>{
    
    // Finding the doctor from database
    User.findById(req.params.id, (err, doctor)=>{
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            
            // Create a meeting in DB
            Meeting.create(req.body.meeting, (err, meeting)=>{
                if(err){
                    counsole.log(err);
                    res.redirect("/");
                }else{

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
                    
                    res.redirect("/patient/profile");
                }
            });
        }
    });
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