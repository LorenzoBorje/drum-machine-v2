'use strict'

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const {DATABASE_URL, PORT} = require('./config');
const { Patterns } = require('./models');

app.use(express.static('public'));

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