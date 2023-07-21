const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var myschema = new Schema({
    task_title: String,
    task_details: String,
    task_date_time: String,
    task_status: String,
})
module.exports = mongoose.model('tbl_task', myschema);