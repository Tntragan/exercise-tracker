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
  date: { type: String, default: new Date().toDateString() },
})

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
})

app.post('/api/users', async (req, res) => {
  const person = new Person(req.body);
  const personExists = await Person.find({ username: person.username }).count() > 0;
  if (!personExists) {
    console.log("He exists")
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


  // person.save()
  //   .then((result) => {
  //     res.json({
  //       username: person,
  //       _id
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
