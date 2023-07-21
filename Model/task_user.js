const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var myschema1 = new Schema({
    user_name: String,
    user_email: String,
    user_pwd: String,
    user_mobile: Number,
    user_photo: String
})


module.exports = mongoose.model('tbl_user', myschema1);
