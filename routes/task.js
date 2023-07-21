var express = require('express');
var router = express.Router();
var taskModel_detail = require('../Model/task_details');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/form_task', function (req, res, next) {
    res.render('form_task');
});

router.post('/form_task', function (req, res, next) {
    //  console.log(req.body);
    var a = req.body.txt1;
    var b = req.body.txt2;
    var c = req.body.txt3;
    var d = req.body.txt4;
    console.log(a);

    var mydata = {
        task_title: a,
        task_details: b,
        task_date_time: c,
        task_status: d
    }
    var result = taskModel_detail(mydata);
    result.save();
    res.redirect('/task/tbl_task')
});

router.get('/tbl_task', function (req, res, next) {
    taskModel_detail.find().then(function (mydata) {
        console.log(mydata);
        res.render('tbl_task', { data: mydata });
    })
});

router.get('/delete_task_details/:id', function (req, res, next) {
    var id = req.params.id;
    taskModel_detail.findByIdAndDelete(id).then(function (mydata) {
        res.redirect('/task/tbl_task');
    })
})

router.get('/edit_task_details/:id', function (req, res, next) {
    var id = req.params.id;
    taskModel_detail.findById(id).then(function (mydata) {
        res.render('form_update_task', { data: mydata });
    })
})

router.post('/update_task_details/:id', function (req, res, next) {
    var id = req.params.id;
    var a = req.body.txt1;
    var b = req.body.txt2;
    var c = req.body.txt3;
    var d = req.body.txt4;
    console.log(a);

    var mydata = {
        task_title: a,
        task_details: b,
        task_date_time: c,
        task_status: d
    }

    taskModel_detail.findByIdAndUpdate(id, mydata).then(function (mydata) {
        res.redirect('/task/tbl_task');
    })
})


router.get('/display-api', function (req, res, next) {
    taskModel_detail.find().then(function (mydata) {
        console.log(mydata);
        res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Found', 'data': mydata }));
    })
});

router.get('/display-id-api/:id', function (req, res, next) {
    var id = req.params.id;

    taskModel_detail.findById(id).then(function (mydata) {
        console.log(mydata);
        res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Found', 'studentdata': mydata }));
    })
});

router.post('/get-api', function (req, res, next) {
    var a = req.body.txt1;
    var b = req.body.txt2;
    var c = req.body.txt3;
    var d = req.body.txt4;
    console.log(a);

    var mydata = {
        task_title: a,
        task_details: b,
        task_date_time: c,
        task_status: d
    }

    var result = taskModel_detail(mydata);
    result.save();
    res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Added' }));

});

router.delete('/delete-api/', function (req, res, next) {
    var id = req.body.id;
    taskModel_detail.findByIdAndRemove(id).then(function (mydata) {
        console.log(mydata);
        res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Deleted' }));
    })
});

router.put('/update-api/:id', function (req, res, next) {
    var id = req.params.id;

    var mydata = {
        task_details: req.body.txt2,
        task_status: req.body.txt4
    }

    // res.render('index', { title: 'Express' });
    taskModel_detail.findByIdAndUpdate(id, mydata).then(function (result) {
        res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Updated' }));
    });
});

module.exports = router;
