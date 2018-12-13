'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const expect = chai.expect;


const {Patterns} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// seed database
function seedBlogData() {
  console.info('Seeding test database');
  const seedData = [];
  for (let i = 0; i < 10; i++){
    seedData.push(generatePatternData());
  }
  return Patterns.insertMany(seedData);
}



function generateBooleanPattern() {
  let sequence = []
  for (let i = 0; i < 16; i++) {
    sequence.push(faker.random.boolean());
  }
  return sequence;
}

function generateDrumSequence() {
  return {
    kick: generateBooleanPattern(),
    snare: generateBooleanPattern(),
    hihat: generateBooleanPattern(),
    openhat: generateBooleanPattern()
  }
}

// generate blog data
function generatePatternData() {

  return {
    title: faker.lorem.slug(2),
    user: faker.name.firstName(),
    pattern: generateDrumSequence(),
    bpm: faker.random.number()
  }
}

// teardown database
function teardownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('drum machine endpoints', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  
  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return teardownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('basic server test', function(){
  
    it('should return 200 and serve index.html', function() {
      return chai.request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      })
    });

  });

  describe('GET endpoint', function() {

    it('should retrieve all saved patterns', function() {
      let res;
      return chai.request(app)
        .get('/patterns')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          return Patterns.countDocuments();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    it('should retrieve patterns with the right fields', function() {
      return chai.request(app)
        .get('/patterns')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(function(pattern) {
            expect(pattern).to.be.a('object');
            expect(pattern).to.have.keys('id', 'title', 'pattern','created', 'user', 'bpm');
          });
        });
````});

    it('should retrieve patterns with specific id', function() {
      let resPost;
      return chai.request(app)
        .get('/patterns')
        .then(function(res) {
          resPost = res.body[0];
          return Patterns.findById(resPost.id);
        })
        .then(function(pattern) {
          expect(resPost.id).to.equal(pattern.id);
          expect(resPost.title).to.equal(pattern.title);
          // expect(resPost.pattern).to.equal(pattern.pattern);
          expect(resPost.user).to.contain(pattern.user);
        });
    });  

  });

  describe('POST endpoint', function() {
   
    it('should add a new post', function() {
      
      const newPattern = {
        user: faker.random.word(),
        pattern: generateDrumSequence(),
        bpm: faker.random.number()
      }      
      return chai.request(app)
        .post('/patterns')
        .send(newPattern)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'pattern','created', 'user', 'bpm');
        })
    });

    it('should verify all required fields are present', function() {
      const newPattern = {
        pattern: generateDrumSequence(),
        bpm: faker.random.number()
      }

      return chai.request(app)
        .post('/patterns')
        .send(newPattern)
        .then(function(res) {
          expect(res).to.have.status(400);
        });     
    });


  });

  describe('PUT endpoint', function() {
    it('should update a pattern', function() {
      
      const updatePattern = generatePatternData();

      return Patterns.findOne()
      .then(function(post) {
        updatePattern.id = post.id;
        return chai.request(app)
        .put(`/patterns/${updatePattern.id}`)
        .send(updatePattern)
        .then(function(res) {
          expect(res).to.have.status(204);
        });
      })
    });
  });

});