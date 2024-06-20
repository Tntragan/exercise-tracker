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

// const logSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   count: Number,
//   log: [{
//     description: String,
//     duration: Number,
//     date: String
//   }]
// });

const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date
});

const Person = mongoose.model('Person', peopleSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);
// const Log = mongoose.model('Log', logSchema);

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
        date: date
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


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
