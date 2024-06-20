const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const peopleSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
});

const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date,
  userId: String
});

const Person = mongoose.model('Person', peopleSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  const allUsers = await Person.find({});
  res.json(allUsers)
});

app.post('/api/users', async (req, res) => {
  const person = new Person(req.body);
  const personExists = await Person.find({ username: person.username }).count() > 0;
  if (!personExists) {
    await person.save()
    res.json({
      username: person.username,
      _id: person._id
    })
  } else {
    res.json({
      error: "Person already exists!"
    })
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  const { description, duration, date } = req.body;
  console.log(req.body);

  try {
    const user = await Person.findById(id);
    if (!user) {
      res.send("Could not find user!");
    } else {
      const exerciseObj = new Exercise({
        username: user.username,
        description,
        duration: Number(duration),
        date: date ? new Date(date.replace(/-/g, '\/')).toDateString() : new Date().toDateString(),
        userId: user._id
      })
      await exerciseObj.save()
      res.json({
        username: user.username,
        description,
        duration: Number(duration),
        date: date ? new Date(date.replace(/-/g, '\/')).toDateString() : new Date().toDateString(),
        _id: id
      })
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;
  try {
    const user = await Person.findById(id);
    if (!user) {
      res.send("No user exists with that Id!")
    } else {
      let dateObj = {};
      if (from) {
        dateObj["$gte"] = new Date(from);
      }
      if (to) {
        dateObj["$lte"] = new Date(to);
      }
      let filter = { userId: id };
      if (from || to) {
        filter.date = dateObj
      }

      const logs = await Exercise.find(filter).limit(+limit ?? 500);

      const allLogs = logs.map((e) => ({
        description: e.description,
        duration: Number(e.duration),
        date: e.date.toDateString()
      }))
      const logsObj = ({
        username: user.username,
        count: logs.length,
        _id: user._id,
        log: allLogs
      })
      res.json(logsObj)
    }
  } catch (err) {
    console.log(err);
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
