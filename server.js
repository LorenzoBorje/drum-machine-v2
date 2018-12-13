'use strict'

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const faker = require('faker');

const {DATABASE_URL, PORT} = require('./config');
const { Patterns } = require('./models');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());


app.get('/patterns', (req, res) => {
  Patterns
    .find()
    .then(patterns => {
      res.json(patterns.map(pattern => pattern.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.get('/patterns/:id', (req, res) => {
  Patterns
    .findById(req.params.id)
    .then(pattern => res.json(pattern.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.post('/patterns', (req, res) => {
  
  const requiredFields = ['pattern', 'user', 'bpm'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Patterns
    .create({
      title: `${faker.hacker.adjective()} ${faker.commerce.color()}`,
      pattern: req.body.pattern,
      user: req.body.user,
      bpm: req.body.bpm
    })
    .then(pattern => res.status(201).json(pattern.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });


});

let server;


function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };