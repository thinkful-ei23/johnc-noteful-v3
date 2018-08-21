const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tags');

const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);


describe('Tag endpoints', function(){
    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
        .then(() => mongoose.connection.db.dropDatabase());
    });
    
    beforeEach(function () {
        return Promise.all([
            Tag.insertMany(seedTags),
            Tag.createIndexes()
        ]);
    });
    
    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });
    
    after(function () {
        return mongoose.disconnect();
    });

    let res;
    describe('GET /api/tags',function(){
        it('should return all tags',function(){
            return chai.request(app)
            .get('/api/tags')
            .then(_res =>{
                res = _res
                expect(res).to.be.json
                expect(res.body).to.be.a('array')
                expect(res).to.have.status(200)
                expect(res.body).to.have.lengthOf.at.least(1);
                return Tag.find().count()
            })
            .then(result =>{
                expect(result).to.be.equal(res.body.length)
            })
        });
        it('should return 404 for a bad path',function(){
            return chai.request(app)
            .get('/api/tagssfg')
            .then(res =>{
                expect(res).to.have.status(404)
            })
        });
    });


    describe('GET /api/tags/:id',function(){
        it('should return the correct tag',function(){

            let data;
            return Tag.findOne()
                .then(_data => {
                    data = _data;

                    return chai.request(app)
                    .get(`/api/tags/${data.id}`)
                })
            .then(res=>{
                expect(res).to.be.json
                expect(res.body).to.be.a('object')
                expect(res).to.have.status(200)
                expect(res.body.name).to.equal(data.name)
            });
        });
        it('should return invalid id when id is not valid',function(){

            return chai.request(app).get('/api/tags/RandoId')
            .then(res =>{
                expect(res).to.have.status(404)
                expect(res.body.message).to.equal('The `id` is not valid')
            })
        });
        it('should return 404 when it has a bad path',function(){

            return chai.request(app).get('/api/tags12345')
            .then( res=>{
                expect(res).to.have.status(404)
            })
        });
    });

    describe('POST /api/tags',function(){
        it('should post a new tag',function(){
            const newItem ={name: 'Super Awesome Name'}

            return chai.request(app).post('/api/tags').send(newItem)
            .then(res =>{
                expect(res).to.be.json
                expect(res.body).to.be.a('object')
                expect(res).to.have.status(201)

                return Tag.findById(res.body.id)
            })
            .then(result=>{
                expect(result.name).to.equal(newItem.name)
            })
        });
        it('should return Missing `name` in request body',function(){
            const badItem = {name:null}

            return chai.request(app).post('/api/tags').send(badItem)
            .then(res =>{
                expect(res).to.have.status(400)
                expect(res.body.message).to.equal('Missing `name` in request body')
            })
        });
        it('should return The tag name already exists',function(){
            return Tag.findOne()
                .then(data => {
                    const badItem = {name: data.name}

                    return chai.request(app)
                    .post('/api/tags').send(badItem)
                })
                .then(res =>{
                    expect(res).to.have.status(400)
                    expect(res.body.message).to.equal('The tag name already exists')
                })
        })
        it('should return 404 for a bad path',function(){
            const newItem ={name: 'Super Awesome Name'}
            return chai.request(app).post('/api/taggs').send(newItem)
            .then(res =>{
                expect(res).to.have.status(404)
            })
        })
    })

    describe('PUT /api/tags/:id',function(){
        it('should return an updated tag',function(){
            const updatedItem ={name: 'Super Awesome Name'}
            let data;

            return Tag.findOne()
                .then(_data => {
                    data = _data;

                    return chai.request(app)
                    .put(`/api/tags/${data.id}`)
                    .send(updatedItem)
                    .then(res =>{
                        expect(res).to.be.json
                        expect(res).to.be.a('object')
                        expect(res).to.have.status(200)

                        return Tag.findById(data.id)
                    })
                    .then(result =>{
                        expect(result.name).to.equal(updatedItem.name)
                    })
                });
        });
        it('should return The `id` is not valid',function(){
            const updatedItem ={name: 'Super Awesome Name'}
            let data;

            return Tag.findOne()
                .then(_data => {
                    data = _data;

                    return chai.request(app)
                    .put(`/api/tags/${data.id}2`)
                    .send(updatedItem)
                })
                .then(res=>{
                    expect(res).to.have.status(404)
                    expect(res.body.message).to.equal('The `id` is not valid')
                })
        });
        it('should return Missing `name` in request body',function(){
            const badItem = {name:null}

            let data;

            return Tag.findOne()
                .then(_data => {
                    data = _data;

                    return chai.request(app)
                    .put(`/api/tags/${data.id}`)
                    .send(badItem)
                })
                .then(res =>{
                    expect(res).to.have.status(400)
                    expect(res.body.message).to.equal('Missing `name` in request body')
                })
        });
        it('should return The tag name already exists',function(){
            return Tag.find().limit(2)
            .then(data => {
                const [item1, item2] = data
                item1.name = item2.name
                return chai.request(app)
                .put(`/api/tags/${item1.id}`).send(item1)
            })
            .then(res =>{
                expect(res).to.have.status(400)
                expect(res.body.message).to.equal('The tag name already exists')
            })
        });
        it('should return 404 bad path',function(){
            const updatedItem ={name: 'Super Awesome Name'}
            let data;

            return Tag.findOne()
                .then(_data => {
                    data = _data;

                    return chai.request(app)
                    .put(`/api/tags${data.id}`)
                    .send(updatedItem)
                })
                .then(res=>{
                    expect(res).to.have.status(404)
                })
        })
    });

    describe('DELETE /api/tags/:id',function(){
        it('should delete a tag by id',function(){
            let data;
            return Tag.findOne()
                .then(_data => {
                    data = _data;

            return chai.request(app).delete(`/api/tags/${data.id}`)
                })
            .then(res =>{
                expect(res).to.have.status(204)
                return Tag.count({_id: data.id})
            })
            .then(results =>{
                expect(results).to.equal(0)
            })
        })
        it('should return The `id` is not valid',function(){
            
            return chai.request(app).delete('/api/tags/RANDOID')
            .then(res =>{
                expect(res).to.have.status(404)
                expect(res.body.message).to.equal('The `id` is not valid')
            })
        })
    })
})