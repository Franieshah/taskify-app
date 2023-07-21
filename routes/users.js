var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const { JsonWebTokenError } = require('jsonwebtoken');
var taskModel_user = require('../Model/task_user');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

var AuthJWT = (req, res, next) => {
  var token = req.headers.authorization;
  token = token.split(' ')[1];
  var privateKey = 'abcdefghhhjjjjjjjkkkkkkkk';
  jwt.verify(token, privateKey, function (err, decoded) {
    if (err) {
      console.log(err);
      res.send({ message: 'Invalid token' });
    }
    else {
      next();
    }
  })
}

router.get('/form_user', function (req, res, next) {
  res.render('form_user');
});


router.post('/form_user', function (req, res, next) {
  //  console.log(req.body);
  var a = req.body.txt1;
  var b = req.body.txt2;
  var c = req.body.txt3;
  var d = req.body.txt4;
  var e = req.files.txt5.name;
  console.log(a);

  var mydata = {
    user_name: a,
    user_email: b,
    user_pwd: c,
    user_mobile: d,
    user_photo: e
  }
  var filedata = req.files.txt5;

  var result = taskModel_user(mydata);
  result.save();
  filedata.mv('public/uploads/' + e, function () {
    res.redirect('/users/tbl_user')
  })

});

router.get('/tbl_user', function (req, res, next) {
  taskModel_user.find().then(function (mydata) {
    console.log(mydata);
    res.render('tbl_user', { data: mydata });
  })
});

router.get('/delete_user/:id', function (req, res, next) {
  var id = req.params.id;
  taskModel_user.findByIdAndDelete(id).then(function (mydata) {
    res.redirect('/users/tbl_user');
  })
})

router.get('/edit_user/:id', function (req, res, next) {
  var id = req.params.id;
  taskModel_user.findById(id).then(function (mydata) {
    res.render('form_update_user', { userdata: mydata });
  })
})

router.post('/update_user/:id', function (req, res, next) {
  var id = req.params.id;
  var a = req.body.txt1;
  var b = req.body.txt2;
  var c = req.body.txt3;
  var d = req.body.txt4;
  var e = req.files.txt5.name;

  var mydata = {
    user_name: a,
    user_email: b,
    user_pwd: c,
    user_mobile: d,
    user_photo: e
  }
  var filedata = req.files.txt5;

  taskModel_user.findByIdAndUpdate(id, mydata).then(function (mydata) {
    filedata.mv('public/uploads/' + e, function () {
      console.log(mydata);
      res.redirect('/users/tbl_user');
    });

  })
})

router.get('/signup', function (req, res, next) {
  res.render('user/signup');
});

router.post('/signup', function (req, res, next) {
  //  console.log(req.body);
  var a = req.body.txt1;
  var b = req.body.txt2;
  var c = req.body.txt3;
  var d = req.body.txt4;
  var e = req.files.txt5.name;
  console.log(a);

  var mydata = {
    user_name: a,
    user_email: b,
    user_pwd: c,
    user_mobile: d,
    user_photo: e
  }
  var filedata = req.files.txt5;

  var result = taskModel_user(mydata);
  result.save();
  filedata.mv('public/uploads/' + e, function () {
    res.redirect('/users/login')
  })

});

router.get('/login', function (req, res, next) {
  res.render('user/login');
});


router.post('/loginprocess', function (req, res, next) {

  var email = req.body.txt1;
  var password = req.body.txt2;

  console.log(req.body);
  taskModel_user.findOne({ "user_email": email })
    .then(function (db_users_array) {

      console.log("Find One " + db_users_array);

      if (db_users_array) {
        var db_email = db_users_array.user_email;
        var db_password = db_users_array.user_pwd;
        var db_name = db_users_array.user_name;
      }

      console.log("db_users_array.user_email " + db_email);
      console.log("db_users_array.user_password " + db_password);

      if (db_email == null) {
        console.log("If");
        res.end("Email not Found");
      }
      else if (db_email == email && db_password == password) {
        req.session.email_user = db_email;
        req.session.username = db_name;
        res.redirect('/users/');
      }
      else {
        console.log("Credentials wrong");
        res.end("Login invalid");
      }
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("An Error Occured..")
    });
});

router.get('/change-password', function (req, res, next) {

  if (!req.session.email_user) {
    console.log("Email Session is Set For User");
    res.redirect('/users/login');
  }

  res.render('change-password');
});

router.post('/change-password', function (req, res, next) {
  if (!req.session.email_user) {
    console.log("Email Session is Set for User");
    res.redirect('/users/login');
  }
  console.log("Home Called " + req.session.email_user);
  var myemail = req.session.email_user;
  var opass = req.body.txt2;
  var npass = req.body.txt3;
  var cpass = req.body.txt4;
  console.log(myemail, opass, npass, cpass);
  taskModel_user.findOne({ "user_email": myemail })
    .then(function (db_users_array) {

      if (!db_users_array) {
        console.log("Error in Old Password Fetch " + err);
      } else {
        console.log(db_users_array);


        if (opass == db_users_array.user_pwd) {

          if (opass == npass) {
            res.end("New Password Must be Different then Old password");
          } else {

            if (npass == cpass) {

              taskModel_user.findOneAndUpdate({ "user_email": myemail }, { $set: { "user_pwd": npass } }).then(function () {
                res.send("Password Changed");
              });
            } else {
              res.end("New Password and Confirm Password not match");
            }
          }

        } else {
          res.end("Old Password Not Match");
        }
      }
    })
    .catch((err) => {
      console.log("Error in password fatch.." + err);
    });
});

router.get('/forgot-password', function (req, res, next) {
  res.render('user/forgot-password');
});

router.post('/forgot-password', function (req, res, next) {

  var email = req.body.txt1;

  console.log(req.body);
  taskModel_user.findOne({ "user_email": email }).then(function (db_users_array) {

    console.log("Find One " + db_users_array);

    if (db_users_array) {
      var db_email = db_users_array.user_email;
      var db_password = db_users_array.user_pwd;

    }

    console.log("db_users_array.user_email " + db_email);
    console.log("db_users_array.user_password " + db_password);

    if (db_email == null) {
      console.log("If");
      res.end("Email not Found");
    }
    else if (db_email == email) {

      "use strict";
      const nodemailer = require("nodemailer");

      // async..await is not allowed in global scope, must use a wrapper
      async function main() {

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: 'mydemo989@gmail.com', // generated ethereal user
            pass: "onbfwqgmfhzyudbh" // generated ethereal password
          }
        });

        // setup email data with unicode symbols
        let mailOptions = {
          from: 'mydemo989@gmail.com', // sender address
          to: email, // list of receivers
          subject: "Forgot Password", // Subject line
          text: "Hello your password is " + db_password, // plain text body
          html: "Hello your password is " + db_password // html body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.end("Password Sent on your Email");
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      }

      main().catch(console.error);

    }
    else {
      console.log("Credentials wrong");
      res.end("Login invalid");
    }
  });
});

router.get('/logout', function (req, res) {

  req.session.destroy();
  res.redirect("/");
});

router.post('/login-api', function (req, res, next) {

  var email = req.body.user_email;
  var password = req.body.user_pwd;

  console.log(req.body);
  taskModel_user.findOne({ "user_email": email })
    .then(function (db_users_array) {

      console.log("Find One " + db_users_array);

      if (db_users_array) {
        var db_email = db_users_array.user_email;
        var db_password = db_users_array.user_pwd;
        var db_name = db_users_array.user_name;

      }


      console.log("db_users_array.user_email " + db_email);
      console.log("db_users_array.user_password " + db_password);

      if (db_email == null) {
        console.log("If");
        res.end("Email not Found");
      }
      else if (db_email == email && db_password == password) {
        req.session.u_email = db_email;
        req.session.u_name = db_name;
        var privateKey = 'abcdefghhhjjjjjjjkkkkkkkk';
        let params = {
          email: db_users_array.user_email,
          password: db_users_array.user_pwd
        }
        var token = jwt.sign(params, privateKey);
        console.log("Token is : " + token);
        res.send(JSON.stringify({ 'status': 200, 'flag': 1, 'message': "Login Successful", "Token": token }))
      }
      else {
        console.log("Credentials wrong");
        res.end("Login invalid");
      }
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("An Error Occured..")
    });
});

router.post('/forgot-password-api', function (req, res, next) {

  var email = req.body.user_email;

  console.log(req.body);
  taskModel_user.findOne({ "user_email": email }).then(function (db_users_array) {

    console.log("Find One " + db_users_array);

    if (db_users_array) {
      var db_email = db_users_array.user_email;
      var db_password = db_users_array.user_pwd;

    }

    console.log("db_users_array.user_email " + db_email);
    console.log("db_users_array.user_password " + db_password);

    if (db_email == null) {
      console.log("If");
      res.end("Email not Found");
    }
    else if (db_email == email) {

      "use strict";
      const nodemailer = require("nodemailer");

      // async..await is not allowed in global scope, must use a wrapper
      async function main() {

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: 'mydemo989@gmail.com', // generated ethereal user
            pass: "onbfwqgmfhzyudbh" // generated ethereal password
          }
        });

        // setup email data with unicode symbols
        let mailOptions = {
          from: 'mydemo989@gmail.com', // sender address
          to: email, // list of receivers
          subject: "Forgot Password", // Subject line
          text: "Hello your password is " + db_password, // plain text body
          html: "Hello your password is " + db_password // html body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.end("Password Sent on your Email");
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      }

      main().catch(console.error);

    }
    else {
      console.log("Credentials wrong");
      res.end("Login invalid");
    }
  });
});

router.post('/change-password-api', function (req, res, next) {

  var myemail = req.body.user_email;
  var opass = req.body.old_pwd;
  var npass = req.body.new_pwd;
  var cpass = req.body.cnf_pwd;

  taskModel_user.findOne({ "user_email": myemail })
    .then(function (db_users_array) {

      if (!db_users_array) {
        console.log("Error in Old Password Fetch " + err);
      } else {
        console.log(db_users_array);


        if (opass == db_users_array.user_pwd) {

          if (opass == npass) {
            res.end("New Password Must be Different then Old password");
          } else {

            if (npass == cpass) {

              taskModel_user.findOneAndUpdate({ "user_email": myemail }, { $set: { "user_pwd": npass } }).then(function () {
                res.send("Password Changed");
              });
            } else {
              res.end("New Password and Confirm Password not match");
            }
          }

        } else {
          res.end("Old Password Not Match");
        }
      }
    })
    .catch((err) => {
      console.log("Error in password fatch.." + err);
    });
});

router.get('/get-all-users-api', AuthJWT, function (req, res, next) {
  taskModel_user.find().then(function (mydata) {
    console.log(mydata);
    res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Found', 'data': mydata }));
    // if (err) {
    //   Response.errorResponse(err, res)
    // }
    // else {
    //   Response.successResponse('User Listing !', res, data)
    // }
  })
});

router.get('/display-id-api/:id', function (req, res, next) {
  var id = req.params.id;

  taskModel_user.findById(id).then(function (mydata) {
    console.log(mydata);
    res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Found', 'studentdata': mydata }));
  })
});


router.post('/add-users-api', function (req, res, next) {
  var a = req.body.txt1;
  var b = req.body.txt2;
  var c = req.body.txt3;
  var d = req.body.txt4;
  // var e = req.files.txt5.name;

  var mydata = {
    user_name: a,
    user_email: b,
    user_pwd: c,
    user_mobile: d,
    // user_photo: e
  }
  var result = taskModel_user(mydata);
  result.save();
  res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Added' }));

});
router.delete('/delete-api/', function (req, res, next) {
  var id = req.body.id;
  taskModel_user.findByIdAndRemove(id).then(function (mydata) {
    console.log(mydata);
    res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Deleted' }));
  })
});

router.put('/update-api/:id', function (req, res, next) {
  var id = req.params.id;
  var mydata = {
    user_name: req.body.txt1,
    user_mobile: req.body.txt4,
  }
  // res.render('index', { title: 'Express' });
  taskModel_user.findByIdAndUpdate(id, mydata).then(function (result) {
    res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Updated' }));
  });
});

module.exports = router;
