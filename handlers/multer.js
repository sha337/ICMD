const multer  = require("multer");

let storage=multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/profile_images/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+file.originalname)
    }
})

module.exports=multer({storage:storage}); 