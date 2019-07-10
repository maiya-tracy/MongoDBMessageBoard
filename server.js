var express = require("express");

var path = require("path");
var session = require('express-session');

var app = express();
var bodyParser = require('body-parser');
const server = app.listen(1337);
const io = require('socket.io')(server);

app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}))

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Message');

const flash = require('express-flash');
app.use(flash());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({
  limit: '5mb'
}));

app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

var CommentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5
  },
  name: {
    type: String,
    required: true,
    minlength: 2
  }
}, {
  timestamps: true
})
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

var MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5
  },
  name: {
    type: String,
    required: true,
    minlength: 2
  },
  comments: [CommentSchema]
}, {
  timestamps: true
})
mongoose.model('Message', MessageSchema);
var Message = mongoose.model('Message');

app.get('/', function(req, res) {
  Message.find({}, (err, messages) => {
    Comment.find({}, (err, comments) => {
      res.render("index", {
        messages: messages,
        comments: comments,
      });
    })
  });
});

app.post("/messages", function(req, res) {
  Message.create(req.body, (err, data) => {
    if (err) {
      console.log("We have an error!", err);
      for (var key in err.errors) {
        req.flash('messageserrors', err.errors[key].message);
      }
      res.redirect('/');
    } else {
      res.redirect("/");
    }
  })
});

app.post("/comments", function(req, res) {
  Comment.create(req.body, (err, comment) => {
    if (err) {
      // console.log("Comments error!", err);
      for (var key in err.errors) {
        req.flash('messageserrors', err.errors[key].message);
      }
      res.redirect('/');
    } else {
      Message.findByIdAndUpdate(req.body.message_id, {
        $addToSet: {
          comments: comment
        }
      }, {
        new: true
      }, (err) => {
        if (err) {
          // console.log("Comments error!", err);
          for (var key in err.errors) {
            req.flash('commentserrors', err.errors[key].message);
          }
        }
        res.redirect("/");
      })
    }
  })
});
// var comment = new Comment({
//   comment: req.body.comment,
//   name: req.body.comment_name
// });
// comment.save(function(err) {
//     if (err) {
//       console.log("We have an error!", err);
//       for (var key in err.errors) {
//         req.flash('commentserrors', err.errors[key].message);
//       }
//       res.redirect('/');
//     } else {
//       adding_comment = {
//         $addToSet: {
//           comments: comment
//         }
//       }
//       Message.findByIdAndUpdate(req.body.message_id, adding_comment, {
//         runValidators: true,
//         new: true
//       }, (err) => {
//         if (err) {
//           console.log("We have an error!", err);
//           for (var key in err.errors) {
//             req.flash('messageserrors', err.errors[key].message);
//           }
//           res.redirect('/');
//         } else {
//           res.redirect("/");
//         }
//         res.redirect("/");
//       });
//     }
//   };
// });
