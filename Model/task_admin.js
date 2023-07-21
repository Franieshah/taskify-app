const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var myschema = new Schema({
    admin_name: String,
    admin_last_name: String,
    admin_email: String,
    admin_gender: String,
    admin_pwd: String,
    admin_cnf_pwd: String
})


module.exports = mongoose.model('tbl_admins', myschema);
