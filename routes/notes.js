var express = require('express');
var router = express.Router();
var taskModel_notes = require('../Model/task_notes');


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


router.get('/form_notes', function (req, res, next) {
    res.render('form_notes');
});

router.post('/form_notes', function (req, res, next) {
    //  console.log(req.body);
    var a = req.body.txt1;
    var b = req.body.txt2;
    var c = req.body.txt3;
    console.log(a);

    var mydata = {
        notes_title: a,
        notes_details: b,
        notes_date_time: c
    }
    var result = taskModel_notes(mydata);
    result.save();
    res.redirect('/notes/tbl_notes')
});

router.get('/tbl_notes', function (req, res, next) {
    taskModel_notes.find().then(function (mydata) {
        console.log(mydata);
        res.render('tbl_notes', { data: mydata });
    })
});

router.get('/delete_notes/:id', function (req, res, next) {
    var id = req.params.id;
    taskModel_notes.findByIdAndDelete(id).then(function (mydata) {
        res.redirect('/notes/tbl_notes');
    })
})

router.get('/edit_notes/:id', function (req, res, next) {
    var id = req.params.id;
    taskModel_notes.findById(id).then(function (mydata) {
        res.render('form_update_notes', { data: mydata });
    })
})

router.post('/update_notes/:id', function (req, res, next) {
    var id = req.params.id;
    var a = req.body.txt1;
    var b = req.body.txt2;
    var c = req.body.txt3;
    console.log(a);

    var mydata = {
        notes_title: a,
        notes_details: b,
        notes_date_time: c
    }

    taskModel_notes.findByIdAndUpdate(id, mydata).then(function (mydata) {
        res.redirect('/notes/tbl_notes');
    })
})

router.get('/display-api', function (req, res, next) {
    taskModel_notes.find().then(function (mydata) {
        console.log(mydata);
        res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Found', 'data': mydata }));
    })
});

router.get('/display-id-api/:id', function (req, res, next) {
    var id = req.params.id;

    taskModel_notes.findById(id).then(function (mydata) {
        console.log(mydata);
        res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Found', 'data': mydata }));
    })
});

router.post('/get-api', function (req, res, next) {
    var a = req.body.txt1;
    var b = req.body.txt2;
    var c = req.body.txt3;
    console.log(a);

    var mydata = {
        notes_title: a,
        notes_details: b,
        notes_date_time: c
    }

    var result = taskModel_notes(mydata);
    result.save();
    res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Added' }));

});

router.delete('/delete-api/', function (req, res, next) {
    var id = req.body.id;
    taskModel_notes.findByIdAndRemove(id).then(function (mydata) {
        console.log(mydata);
        res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Deleted' }));
    })
});

router.put('/update-api/:id', function (req, res, next) {
    var id = req.params.id;
    var mydata = {
        notes_details: req.body.txt2,
        notes_date_time: req.body.txt3
    }
    // res.render('index', { title: 'Express' });
    taskModel_notes.findByIdAndUpdate(id, mydata).then(function (result) {
        res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Updated' }));
    });
});


module.exports = router;
