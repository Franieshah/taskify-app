var express = require('express');

var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
const { JsonWebTokenError } = require('jsonwebtoken');
var taskModel_admin = require('../Model/task_admin');


var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'sdasdsadsakjslkjsdlfjsdklfjsdklfjsdklfjsdklfjsdkjfsddfsdfkjsdlfjsdf';
passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
  console.log(jwt_payload.email);
  taskModel_admin.findOne({ admin_email: jwt_payload.email }).then(function (err, user) {
    if (err) {
      console.log(err);
      return done(err, false);
    }
    if (user) {
      console.log("Admin Data " + user);
      return done(null, user);
    } else {
      console.log('else');
      return done(null, false);
      // or you could create a new account
    }
  });
}));


/* GET home page. */


var AuthJWT = (req, res, next) => {
  var token = req.headers.authorization;
  token = token.split(' ')[1];
  var privateKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
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


router.get('/', function (req, res, next) {

  console.log("Home Called " + req.session.email);
  var myemail = req.session.email;
  console.log(myemail);

  //Auth
  if (!req.session.email) {
    console.log("Email Session is Set");
    res.end("Login required to Access this page");
  }
  res.render('index', { myemail: myemail });
});


router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  var data = {
    admin_name: req.body.txt1,
    admin_last_name: req.body.txt2,
    admin_email: req.body.txt3,
    admin_gender: req.body.gender,
    admin_pwd: req.body.txt5
  }
  var data = taskModel_admin(data);
  data.save();
  res.render('login');
});


router.get('/tbl_admin', function (req, res, next) {
  taskModel_admin.find().then(function (mydata) {
    console.log(mydata);
    res.render('tbl_admin', { data: mydata });
  })
});

router.get('/delete_admin/:id', function (req, res, next) {
  var id = req.params.id;
  taskModel_admin.findByIdAndDelete(id).then(function (mydata) {
    res.redirect('/tbl_admin');
  })
})


router.get('/login', function (req, res, next) {
  res.render('login');
});


router.post('/loginprocess', function (req, res, next) {

  var email = req.body.txt1;
  var password = req.body.txt2;

  console.log(req.body);
  taskModel_admin.findOne({ "admin_email": email })
    .then(function (db_users_array) {

      console.log("Find One " + db_users_array);

      if (db_users_array) {
        var db_email = db_users_array.admin_email;
        var db_password = db_users_array.admin_pwd;
        var db_name = db_users_array.admin_name;
      }

      console.log("db_users_array.admin_email " + db_email);
      console.log("db_users_array.admin_password " + db_password);

      if (db_email == null) {
        console.log("If");
        res.end("Email not Found");
      }
      else if (db_email == email && db_password == password) {
        req.session.email = db_email;
        req.session.admin_name = db_name;
        res.redirect('/');
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

  if (!req.session.email) {
    console.log("Email Session is Set");
    res.redirect('/login');
  }

  res.render('change-password');
});

router.post('/change-password', function (req, res, next) {
  if (!req.session.email) {
    console.log("Email Session is Set");
    res.redirect('/login');
  }
  console.log("Home Called " + req.session.email);
  var myemail = req.session.email;
  var opass = req.body.txt2;
  var npass = req.body.txt3;
  var cpass = req.body.txt4;
  console.log(myemail, opass, npass, cpass);
  taskModel_admin.findOne({ "admin_email": myemail })
    .then(function (db_users_array) {

      if (!db_users_array) {
        console.log("Error in Old Password Fetch " + err);
      } else {
        console.log(db_users_array);


        if (opass == db_users_array.admin_pwd) {

          if (opass == npass) {
            res.end("New Password Must be Different then Old password");
          } else {

            if (npass == cpass) {

              taskModel_admin.findOneAndUpdate({ "admin_email": myemail }, { $set: { "admin_pwd": npass } }).then(function () {
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
  res.render('forgot-password');
});

router.post('/forgot-password', function (req, res, next) {

  var email = req.body.txt1;

  console.log(req.body);
  taskModel_admin.findOne({ "admin_email": email }).then(function (db_users_array) {

    console.log("Find One " + db_users_array);

    if (db_users_array) {
      var db_email = db_users_array.admin_email;
      var db_password = db_users_array.admin_pwd;

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


router.post('/add-users-api', function (req, res, next) {
  var data = {
    admin_name: req.body.txt1,
    admin_last_name: req.body.txt2,
    admin_email: req.body.txt3,
    admin_gender: req.body.gender,
    admin_pwd: req.body.txt5
  }

  var result = taskModel_admin(data);
  result.save();
  res.send(JSON.stringify({ 'flag': 1, 'message': 'Record Added' }));

});

// router.get('/get-all-users-api', AuthJWT, async function (req, res, next) {
//   const data = await taskModel_admin.find({});
//   console.log(data);
// });
router.get('/get-all-users-api', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  //router.get('/get-all-users-api', AuthJWT, function (req, res, next) {
  taskModel_admin.find({}).then(function (err, data) {
    if (data.length > 0) {
      console.log("Data is : " + data);
      res.send(JSON.stringify({ 'flag': 1, 'message': 'Record found', 'data': data }))
    }
    else {
      res.send(JSON.stringify({ 'flag': 0, 'message': 'Record Not found', data: {} }))
    }
  })
    .catch((error) => {
      console.log(error);
      res.send(JSON.stringify({ 'error': true, message: 'Something  broken' }))
    })
});

router.post('/login-api', function (req, res, next) {

  var email = req.body.admin_email;
  var password = req.body.admin_pwd;

  console.log(req.body);
  taskModel_admin.findOne({ "admin_email": email })
    .then(function (db_users_array) {

      console.log("Find One " + db_users_array);

      if (db_users_array) {
        var db_email = db_users_array.admin_email;
        var db_password = db_users_array.admin_pwd;

      }

      console.log("db_users_array.admin_email " + db_email);
      console.log("db_users_array.admin_password " + db_password);

      if (db_email == null) {
        console.log("If");
        res.send(JSON.stringify({ "status": 200, "flag": 1, "message": "Login Fails. No User", "data": ' ' }));
      }
      else if (db_email == email && db_password == password) {
        var privateKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        let params = {
          email: db_users_array.admin_email,
          password: db_users_array.admin_pwd
        }
        var token = jwt.sign(params, privateKey);
        console.log("Token is : " + token);
        res.send(JSON.stringify({ "status": 200, "flag": 1, "message": "Login Successful", "Token": token }));

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

  var email = req.body.admin_email;

  console.log(req.body);
  taskModel_admin.findOne({ "admin_email": email }).then(function (db_users_array) {

    console.log("Find One " + db_users_array);

    if (db_users_array) {
      var db_email = db_users_array.admin_email;
      var db_password = db_users_array.admin_pwd;

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
  var myemail = req.body.admin_email;
  var opass = req.body.old_pwd;
  var npass = req.body.new_pwd;
  var cpass = req.body.cnf_pwd;
  console.log(myemail, opass, npass, cpass);
  taskModel_admin.findOne({ "admin_email": myemail })
    .then(function (db_users_array) {

      if (!db_users_array) {
        console.log("Error in Old Password Fetch " + err);
      } else {
        console.log(db_users_array);


        if (opass == db_users_array.admin_pwd) {

          if (opass == npass) {
            res.end("New Password Must be Different then Old password");
          } else {

            if (npass == cpass) {

              taskModel_admin.findOneAndUpdate({ "admin_email": myemail }, { $set: { "admin_pwd": npass } }).then(function () {
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


module.exports = router;
