'use strict'

const express = require('express');
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');

const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

describe('drum machine endpoints', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  
  after(function() {
    return closeServer();
  });

  describe('basic server test', function(){
  
    it('should return 200 and serve index.html', function() {
      app.get('/', function(req, res) {
        expect(res).status.have.status(200);
        expect(res).to.be.html;
      })
    });
  });

});