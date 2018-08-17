const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe('noteful folder method tests', function(){

    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
        .then(() => mongoose.connection.db.dropDatabase());
    });
    
    beforeEach(function () {
        return Promise.all([
            Folder.insertMany(seedFolders),
            Folder.createIndexes()
        ]);
    });
    
    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });
    
    after(function () {
        return mongoose.disconnect();
    });


    describe('GET /api/folders', function(){
        it('should return all folders', function(){

            let res;
            return chai.request(app)
                .get('/api/folders')
                .then(_res =>{
                    res = _res
                    expect(res).to.be.json;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf.at.least(1);
                return Folder.find().count()
                })
            .then(folders =>{
                expect(res.body.length).to.be.equal(folders)
            })
        });
        it('should not return folders', function(){
            return chai.request(app)
                .get('/api/silly/folders')
                .then(res =>{
                    expect(res).to.have.status(404);
                })
        })
    });

    describe('GET /api/folders/:id', function(){
        it('should return a specific folder',function(){

            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app).get(`/api/folders/${data.id}`)
                })
            .then(res =>{
                expect(res).to.be.json
                expect(res.body).to.be.a('object')
                expect(res).to.have.status(200)

                expect(res.body.name).to.equal(data.name)
            })
        })
        it('should not return a folder',function(){

            let data;
            return Folder.findOne()
                .then(_data =>{
                    data = _data;

                    return chai.request(app).get(`/api/folders${data.id}`)
                })
                .then(res =>{
                    expect(res).to.have.status(404)
                    expect(res.body).to.not.equal(data)
                })
        })
    });

    describe('POST /api/folders',function(){
        it('should create a new folder',function(){
            const newItem ={name: 'Super Awesome Name'}

            return chai.request(app)
            .post('/api/folders')
            .send(newItem)
            .then(res =>{
                expect(res).to.be.json;
                expect(res).to.be.a('object')

            return Folder.findById(res.body.id)
        })
            .then(data =>{
                expect(data.name).to.be.equal(newItem.name)
            })
        })
        it('should not create a new folder',function(){

            const newItem2 = {name:null}
            return chai.request(app)
                .post('/api/folders')
                .send(newItem2)
                .then(res =>{
                    expect(res).to.have.status(400)
                })
        })
    });


    describe('PUT /api/folders/:id',function(){
        it('should update a folder by id',function(){
            const updateItem = {name:'wolulu'}

            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;
                return chai.request(app).put(`/api/folders/${data.id}`)
                .send(updateItem)
                })
                .then(res =>{
                    expect(res).to.be.a('object')
                    expect(res).to.be.json

                return Folder.findById(data.id)
                })
                .then(result =>{
                    expect(result.id).to.be.equal(data.id)
                    expect(result.name).to.be.equal(updateItem.name)
                })
        })
        it('should not update the folder',function(){
            const UpdateItem2 = {name:null}

            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;
                return chai.request(app).put(`/api/folders/${data.id}`)
                .send(UpdateItem2)
                })
                .then(res =>{
                    expect(res).to.have.status(400)
                })
        })
    })

    describe('DELETE /api/folders/:id',function(){
        it('should delete a folder by id', function(){
            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app).delete(`/api/folders/${data.id}`)
                })
            .then(res =>{
                expect(res).to.have.status(204)
            return Folder.findById(data.id)
            })
            .then(dbFolder =>{
                expect(dbFolder).to.be.null
            })
        })
        it('should not delete a Folder',function(){
            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app).delete(`/api/folders${data.id}`)
                })
            .then(res=>{
                expect(res).to.have.status(404)
                return Folder.findById(data.id)
            })
            .then(dbFolder=>{
                expect(dbFolder.name).to.be.equal(data.name)
            })
        })
    })

})