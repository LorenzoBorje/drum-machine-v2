const express = require('express');

const router = express.Router();

const { Patterns } = require('../models');


router.get('/:user/patterns', (req, res) => {
  let user = req.params.user;
  console.log(user);
  Patterns
    .find({'user': user})
    .sort({created: 'desc'})
    .then(patterns => {
      res.json(patterns.map(pattern => pattern.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
});


router.get('/patterns', (req, res) => {
  Patterns
    .find()
    .sort({created: 'desc'})
    .then(patterns => {
      res.json(patterns.map(pattern => pattern.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

router.get('/patterns/:id', (req, res) => {
  Patterns
    .findById(req.params.id)
    .then(pattern => res.json(pattern.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

router.post('/patterns', (req, res) => {
  
  const requiredFields = ['pattern', 'user', 'bpm'];
  console.log(req.body);
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
      res.status(500).json({ error: 'Internal server error' });
    });

});

router.put('/patterns/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['pattern', 'bpm'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Patterns
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

router.delete('/patterns/:id', (req, res) => {
  Patterns
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted pattern with id ${req.params.id}`);
      res.status(204).end();
    })
    .catch(err => {
      console.error(err);

    })
});

module.exports = router;