const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('noteful method tests', function(){

    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
        .then(() => mongoose.connection.db.dropDatabase());
    });
    
    beforeEach(function () {
        return Note.insertMany(seedNotes);
    });
    
    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });
    
    after(function () {
        return mongoose.disconnect();
    });


    describe('GET /api/notes', function(){
        it('should return all notes', function(){

            let res;
            return chai.request(app)
                .get('/api/notes')
                .then(_res =>{
                    res = _res
                    expect(res).to.be.json;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf.at.least(1);
                return Note.find().count()
                })
            .then(notes =>{
                expect(res.body.length).to.be.equal(notes)
            })
        });
        it('should not return notes', function(){
            return chai.request(app)
                .get('/api/silly/notes')
                .then(res =>{
                    expect(res).to.have.status(404);
                })
        })
    });

    describe('GET /api/notes/:id', function(){
        it('should return a specific note',function(){

            let data;
            return Note.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app).get(`/api/notes/${data.id}`)
                })
            .then(res =>{
                expect(res).to.be.json
                expect(res.body).to.be.a('object')
                expect(res).to.have.status(200)

                expect(res.body.title).to.equal(data.title)
                expect(res.body.content).to.equal(data.content)
            })
        })
        it('should not return a note',function(){

            let data;
            return Note.findOne()
                .then(_data =>{
                    data = _data;

                    return chai.request(app).get(`/api/notes${data.id}`)
                })
                .then(res =>{
                    expect(res).to.have.status(404)
                    expect(res.body).to.not.equal(data)
                })
        })
    });

    describe('POST /api/notes',function(){
        it('should create a new note',function(){
            const newItem ={title:'having fun in the sun',content:'just kidding'}

            return chai.request(app)
            .post('/api/notes')
            .send(newItem)
            .then(res =>{
                expect(res).to.be.json;
                expect(res).to.be.a('object')

            return Note.findById(res.body.id)
        })
            .then(data =>{
                expect(data.title).to.be.equal(newItem.title)
                expect(data.content).to.be.equal(newItem.content)
            })
        })
        it('should not create a new note',function(){

            const newItem2 = {content:'uhoh'}
            return chai.request(app)
                .post('/api/notes')
                .send(newItem2)
                .then(res =>{
                    expect(res).to.have.status(400)
                })
        })
    });


    describe('PUT /api/notes/:id',function(){
        it('should update a note by id',function(){
            const updateItem = {title:'newTitle',content:'wolulu'}

            let data;
            return Note.findOne()
                .then(_data => {
                    data = _data;
                return chai.request(app).put(`/api/notes/${data.id}`)
                .send(updateItem)
                })
                .then(res =>{
                    expect(res).to.be.a('object')
                    expect(res).to.be.json

                return Note.findById(data.id)
                })
                .then(result =>{
                    expect(result.id).to.be.equal(data.id)
                    expect(result.title).to.be.equal(updateItem.title)
                    expect(result.content).to.be.equal(updateItem.content)
                })
        })
        it('should not update the note',function(){
            const UpdateItem2 = {title:null, content: 'wolulu'}

            let data;
            return Note.findOne()
                .then(_data => {
                    data = _data;
                return chai.request(app).put(`/api/notes/${data.id}`)
                .send(UpdateItem2)
                })
                .then(res =>{
                    expect(res).to.have.status(400)
                })
        })
    })

    describe('DELETE /api/notes/:id',function(){
        it('should delete a note by id', function(){
            let data;
            return Note.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app).delete(`/api/notes/${data.id}`)
                })
            .then(res =>{
                expect(res).to.have.status(204)
            return Note.findById(data.id)
            })
            .then(dbNote =>{
                expect(dbNote).to.be.null
            })
        })
        it('should not delete a note',function(){
            let data;
            return Note.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app).delete(`/api/notes${data.id}`)
                })
            .then(res=>{
                expect(res).to.have.status(404)
                return Note.findById(data.id)
            })
            .then(dbNote=>{
                expect(dbNote.title).to.be.equal(data.title)
                expect(dbNote.content).to.be.equal(data.content)
            })
        })
    })



})