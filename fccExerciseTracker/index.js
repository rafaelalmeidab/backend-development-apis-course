require('dotenv').config();

const express = require('express')
const app = express()
const cors = require('cors')
const dns = require('dns');
const urlParser = require('url');
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL);

// //Creating a Schema
let usersSchema = new mongoose.Schema({
  username: { type: String, required: true }
});

let exercisesSchema = new mongoose.Schema({
  id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date
});

// //Creating a model
const Users = mongoose.model('users', usersSchema);
const Exercises = mongoose.model('exercises', exercisesSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

//Routes
app.get("/api/users", async function(req, res) {
  try {
    const allElements = await Users.find();
    res.json(allElements);
  }
  catch (err) {
    console.error(err);
  }
});

app.get("/api/users/:_id/logs", async function(req, res) {
  const id = new ObjectId(req.params._id);
  const { from, to, limit } = req.query;

  var dateObject = {};
  if (from) {
    dateObject['$gte'] = new Date(from);
  }
  if (to) {
    dateObject['$lte'] = new Date(to);
  }

  var filter = { id: id };

  if (from || to) {
    filter.date = dateObject;
  }

  try {
    const ansUsers = await Users.find({ id: id });

    const countElements = await Users.count(({ _id: id }));

    var ansExercises = await Exercises.find(filter).limit(+limit ?? 10);
    if (ansExercises) {
      const log = ansExercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }));

      res.json({
        "_id": id,
        "username": ansUsers.username,
        "count": countElements,
        "log": log
      });
    }
  }
  catch (err) {
    console.log(err);
  }


});

app.post("/api/users/:_id/exercises/", async function(req, res) {
  const id = new ObjectId(req.params._id);
  const { description, duration, date } = req.body;

  try {
    var ansUsers = await Users.findOne({ _id: id });
    if (ansUsers) {
      var exercises = new Exercises({
        id: id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      });

      var ans = await exercises.save();

      res.json({
        "_id": exercises.id,
        "username": ansUsers.username,
        "date": exercises.date.toDateString(),
        "duration": exercises.duration,
        "description": exercises.description
      });
    }
  }
  catch (err) {
    console.log(err);
  }
});

app.post("/api/users/", async function(req, res) {
  try {
    var ans = await Users.findOne({ username: req.body.username });
    if (!ans) {
      var user = new Users({ username: req.body.username });
      var ans = await user.save();
      res.json(ans);
    }
  }
  catch (err) {
    console.log(err);
  }
});