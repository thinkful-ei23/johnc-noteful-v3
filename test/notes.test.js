const chai =require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server')

const { TEST_MONGODB_URI } = require('../config')

const note = require('../models/note')

const seedData = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('noteful method tests', function(){

    before(function(){
        return mongoose.connect(TEST_MONGODB_URI)
        .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function(){
        return note.insertMany(seedData);
    });

    afterEach(function(){
        return mongoose.connection.db.dropDatabase();
    });

    after(function(){
        return mongoose.disconnect();
    });


    describe('GET /api/notes', function(){
        it('should return all notes', function(){
            return chai.request(app)
                .get('api/notes')
                .then(res =>{
                    expect(res).to.be.json;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf.at.least(1);
                })
        })
    })









})