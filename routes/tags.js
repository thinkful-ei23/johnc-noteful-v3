'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Tag = require('../models/tags');
const Note = require('../models/note');
const passport =require('passport');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req,res,next)=>{
    const userId = req.user.id;
    

    Tag.find({userId})
    .then(results=>{
        res.json(results)
    })
    .catch(err => {
        next(err);
    });
});

router.get('/:id',(req,res,next)=>{
    const {id} = req.params;
    const userId = req.user.id

    if(!mongoose.Types.ObjectId.isValid(id)){
        const err = new Error('The `id` is not valid');
        err.status = 404;
        return next(err);
    }


    Tag.findOne({_id: id, userId})
    .then(result=>{
        res.json(result)
    })
    .catch(err=>{
        next(err)
    })
});

router.post('/',(req,res,next)=>{
    const {name} = req.body
    const userId = req.user.id;

    const newItem ={name, userId}

    if (!name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
        }

    Tag.create(newItem)
    .then(result=>{
        res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result)
    })
    .catch(err =>{
        if (err.code === 11000) {
            err = new Error('The tag name already exists');
            err.status = 400;
        }
            next(err);
    })
});

router.put('/:id',(req,res,next)=>{
    const {id} = req.params
    const {name} = req.body
    const userId = req.user.id;

    const updateObj = {name}
    console.log(updateObj)
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 404;
        return next(err);
    }

    if(!name){
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    Tag.findOneAndUpdate({_id:id,userId}, updateObj, {new:true})
    .then(result=>{
        res.json(result)
    })
    .catch(err=>{
        if (err.code === 11000) {
            err = new Error('The tag name already exists');
            err.status = 400;
        }
            next(err);
    })
});

router.delete('/:id',(req,res,next)=>{
    const {id} = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 404;
        return next(err);
    }

    const tagRemove = Tag.findOneAndRemove({_id:id,userId})
    const removeNoteTag = Note.updateMany({$pull:{tags: id}})

    return Promise.all([tagRemove,removeNoteTag])
    .then(()=>{
        res.sendStatus(204)
    })
    .catch(err=>{
        next(err)
    })
})


module.exports = router;