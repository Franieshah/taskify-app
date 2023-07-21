const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var myschema1 = new Schema({
    notes_title: String,
    notes_details: String,
    notes_date_time: String
})


module.exports = mongoose.model('tbl_notes', myschema1);
