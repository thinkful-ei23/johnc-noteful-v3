const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI,JWT_SECRET } = require('../config');

const Folder = require('../models/folder');
const User = require('../models/user')

const seedFolders = require('../db/seed/folders');
const seedUsers = require('../db/seed/users');
const jwt = require('jsonwebtoken')

const expect = chai.expect;
chai.use(chaiHttp);

describe('noteful folder method tests', function(){

    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
        .then(() => mongoose.connection.db.dropDatabase());
    });
    
    let token;
    let user;

    beforeEach(function () {
        return Promise.all([
            User.insertMany(seedUsers),
            Folder.insertMany(seedFolders),
            Folder.createIndexes()
        ])
        .then(([users]) => {
            user = users[0];
            token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
        });
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
                .set('Authorization', `Bearer ${token}`)
                .then(_res =>{
                    res = _res
                    expect(res).to.be.json;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf.at.least(1);
                return Folder.find({userId:user.id}).count()
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
        it('should return 401 for no jwt',function(){
            return chai.request(app)
            .get('/api/folders')
            .then(res=>{
                expect(res).to.have.status(401)
            })
        })
    });

    describe('GET /api/folders/:id', function(){
        it('should return a specific folder',function(){

            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app)
            .get(`/api/folders/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
                })
            .then(res =>{
                expect(res).to.be.json
                expect(res.body).to.be.an('object')
                expect(res).to.have.status(200)

                expect(res.body.name).to.equal(data.name)
            })
        })
        it('should return a 404 bad path for the folder',function(){

            let data;
            return Folder.findOne()
                .then(_data =>{
                    data = _data;

                    return chai.request(app)
                    .get(`/api/folders${data.id}`)
                    .set('Authorization', `Bearer ${token}`)
                })
                .then(res =>{
                    expect(res).to.have.status(404)
                    expect(res.body).to.not.equal(data)
                })
        });

        it('should return not a valid Id',function(){
            return chai.request(app)
            .get('/api/folders/RandoId')
            .set('Authorization', `Bearer ${token}`)
            .then((res)=>{
                expect(res).to.have.status(400)
                expect(res.body.message).to.equal('The `id` is not valid')
            })
        })
    });

    describe('POST /api/folders',function(){
        it('should create a new folder',function(){
            const newItem ={name: 'Super Awesome Name'}

            return chai.request(app)
            .post('/api/folders')
            .set('Authorization', `Bearer ${token}`)
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
        it('should return Missing `name` in request body',function(){

            const newItem2 = {name:null}
            return chai.request(app)
                .post('/api/folders')
                .set('Authorization', `Bearer ${token}`)
                .send(newItem2)
                .then(res =>{
                    expect(res).to.have.status(400)
                    expect(res.body.message).to.be.equal('Missing `name` in request body')
                })
        })
        it('should return Folder name already exists',function(){
            return Folder.findOne()
                .then(data => {
                    const badItem = {name: data.name}

                    return chai.request(app)
                    .post('/api/folders')
                    .set('Authorization', `Bearer ${token}`)
                    .send(badItem)
                })
                .then(res =>{
                    expect(res).to.have.status(400)
                    expect(res.body.message).to.equal('Folder name already exists')
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
                return chai.request(app)
                .put(`/api/folders/${data.id}`)
                .set('Authorization', `Bearer ${token}`)
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
        it('should return Missing `name` in request body',function(){
            const UpdateItem2 = {name:null}

            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;
                return chai.request(app)
                .put(`/api/folders/${data.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(UpdateItem2)
                })
                .then(res =>{
                    expect(res).to.have.status(400)
                    expect(res.body.message).to.equal('Missing `name` in request body')
                })
        });
        it('should return Folder name already exists',function(){
            return Folder.find().limit(2)
            .then(data => {
                const [item1, item2] = data
                item1.name = item2.name
                return chai.request(app)
                .put(`/api/folders/${item1.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(item1)
            })
            .then(res =>{
                expect(res).to.have.status(400)
                expect(res.body.message).to.equal('Folder name already exists')
            })
        });
    })
    it('should return The `id` is not valid',function(){
        const updateItem ={name: "newname"}
        return chai.request(app)
        .put(`/api/folders/RandomId`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateItem)
        .then(res=>{
            expect(res).to.have.status(400)
            expect(res.body.message).to.equal('The `id` is not valid')
        })
    })

    describe('DELETE /api/folders/:id',function(){
        it('should delete a folder by id', function(){
            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app)
            .delete(`/api/folders/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
                })
            .then(res =>{
                expect(res).to.have.status(204)
            return Folder.findById(data.id)
            })
            .then(dbFolder =>{
                expect(dbFolder).to.be.null
            })
        })
        it('should return The `id` is not valid',function(){
            return chai.request(app)
            .delete('/api/folders/RandomId')
            .set('Authorization',`Bearer ${token}`)
            .then(res =>{
                expect(res).to.have.status(400)
                expect(res.body.message).to.equal('The `id` is not valid')
            })
        })
        it('should not delete a Folder',function(){
            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app)
            .delete(`/api/folders${data.id}`)
            .set('Authorization', `Bearer ${token}`)
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