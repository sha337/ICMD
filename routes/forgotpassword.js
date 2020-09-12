const express       = require('express'),
      router        = express.Router(),
      User          = require("../models/user"),
      passport      = require('passport'),
      async         = require('async'),
      sgMail        = require('@sendgrid/mail'),
      util          = require('util'),
      crypto        = require('crypto');

// send grid api key ---- store in process.env
sgMail.setApiKey("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");


// Show forgot password page
router.get('/forgotpassword', (req, res)=>{
    res.render("forgot");
});


// sends mail for reset password
router.put("/forgotpassword", async(req, res)=>{
    // generate a token which will be vaild for 1 hr to reset the password
    const token = await crypto.randomBytes(20).toString('hex');
    const {email} = req.body;
    // find the user based on email provided by user
    const user = await User.findOne({username: email});
    // if that email id dosent exist
    if(!user){
      console.log("User doesnot exist");
      return res.redirect("/forgotpassword");
    }
    // if exist put the token and expire time in database
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    // compile the mail
    const msg = {
      to: email,
      from: 'iconsultmydoctor@gmail.com', // Use the email address or domain you verified above
      subject: 'Reset password',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process: 
      http://${req.headers.host}/reset/${token}  
      If you did not request this, please ignore this email and 
      your password will remain unchanged.`.replace(/    /g, ''),
      // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    // send the mail
    await sgMail.send(msg);
    console.log("An email has been sent to " + email);
    res.redirect('/forgotpassword');
});


// coming back from email reset password
router.get('/reset/:token', async(req, res) => {
    // find the user based on token and expiration time of token
    const token = req.params.token;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    // if not exist or token expires
    if(!user){
      console.log("Password reser token has expired");
      return res.redirect('/forgotpassword');
    }
    // if token is valid show the reset password page
    res.render("reset", {token});
});


// route to reset the password
router.put('/reset/:token', async(req, res)=>{
    // collect the token and find the user
    const token = req.params.token;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    // if dosen't exist or token expired redirect back to forgot password page 
    if(!user){
      console.log("Password reser token has expired");
      return res.redirect('/forgotpassword');
    }

    // if token valid then compare the password in two fields
    if( req.body.password === req.body.confirm ){
      // update the new password
      await user.setPassword(req.body.password);
      // set token to null
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      // save the user and login
      await user.save();
      const login = util.promisify(req.login.bind(req));
      await login(user);
    } //if password dosent match, ask them to enter again
    else {
      console.log("Passwords do not match");
      return res.redirect(`/reset/${token}`);
    }
    // redirect to user profile
    if(user.userType === 'patient'){
      return res.redirect('/patient/profile');
    }
    else if(user.userType === 'doctor'){
      return res.redirect('/doctor/profile');
    }
    res.redirect('/');
});


module.exports = router;