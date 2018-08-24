'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

const User = require('../models/user');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API - Login', function () {

    let token;
    const _id = '333333333333333333333333';
    const fullname = 'Example User';
    const username = 'exampleUser';
    const password = 'examplePass';

    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
        .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () {
        return User.hashPassword(password)
        .then(digest => User.create({
            _id,
            fullname,
            username,
            password: digest
        }));
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function () {
        return mongoose.disconnect();
    });


    describe('POST /api/login',function(){
        it('should create a jwt from the login',function(){
            return chai.request(app)
            .post('/api/login')
            .send({username,password})
            .then(res =>{
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
            })
        });
        it('Should reject requests without credentials', function () {
            return chai.request(app)
              .post('/api/login')
              .send({})
              .then(res => {
                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body.message).to.equal('Bad Request');
              });
          });
      
          it('Should reject requests with empty string username', function () {
            return chai.request(app)
              .post('/api/login')
              .send({ username: '', password })
              .then(res => {
                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body.message).to.equal('Bad Request');
              });
          });
      
          it('Should reject requests with empty string password', function () {
            return chai.request(app)
              .post('/api/login')
              .send({ username, password: '' })
              .then(res => {
                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body.message).to.equal('Bad Request');
              });
          });
      
          it('Should reject requests with incorrect username', function () {
            return chai.request(app)
              .post('/api/login')
              .send({ username: 'wrongUsername', password: 'password' })
              .then(res => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
                expect(res.body.message).to.equal('Unauthorized');
              });
          });
    })





})